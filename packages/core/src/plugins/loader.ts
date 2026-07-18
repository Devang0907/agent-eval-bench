import { join } from "node:path";
import { existsSync, readdirSync } from "node:fs";
import type { Plugin } from "../contracts/plugin.js";
import type { Registry } from "../registry/registry.js";
import { PluginError } from "../errors/index.js";

const PLUGIN_PREFIX = "agent-eval-bench-plugin-";

/**
 * Discover and load community plugins.
 * Looks in node_modules for packages named `agent-eval-bench-plugin-*`
 * and also loads explicitly listed plugins from config.
 */
export async function loadPlugins(
  registry: Registry,
  opts: {
    cwd?: string;
    explicit?: string[];
  } = {},
): Promise<Plugin[]> {
  const cwd = opts.cwd ?? process.cwd();
  const loaded: Plugin[] = [];
  const names = new Set<string>();

  // Explicit plugins from config
  for (const spec of opts.explicit ?? []) {
    const plugin = await importPlugin(spec, cwd);
    if (!names.has(plugin.name)) {
      await registry.registerPlugin(plugin);
      loaded.push(plugin);
      names.add(plugin.name);
    }
  }

  // Auto-discover from node_modules
  const nm = join(cwd, "node_modules");
  if (existsSync(nm)) {
    const entries = safeReaddir(nm);
    for (const entry of entries) {
      if (!entry.startsWith(PLUGIN_PREFIX)) continue;
      try {
        const plugin = await importPlugin(entry, cwd);
        if (!names.has(plugin.name)) {
          await registry.registerPlugin(plugin);
          loaded.push(plugin);
          names.add(plugin.name);
        }
      } catch {
        // Skip packages that don't export a valid plugin
      }
    }

    // Also check @scope/agent-eval-bench-plugin-*
    for (const entry of entries) {
      if (!entry.startsWith("@")) continue;
      const scopeDir = join(nm, entry);
      for (const pkg of safeReaddir(scopeDir)) {
        if (!pkg.startsWith(PLUGIN_PREFIX) && !pkg.includes("agent-eval-bench-plugin")) continue;
        try {
          const plugin = await importPlugin(`${entry}/${pkg}`, cwd);
          if (!names.has(plugin.name)) {
            await registry.registerPlugin(plugin);
            loaded.push(plugin);
            names.add(plugin.name);
          }
        } catch {
          // skip
        }
      }
    }
  }

  return loaded;
}

async function importPlugin(spec: string, cwd: string): Promise<Plugin> {
  try {
    // Local path
    if (spec.startsWith(".") || spec.startsWith("/") || spec.includes(":\\") || spec.includes(":/")) {
      const path = spec.startsWith(".") ? join(cwd, spec) : spec;
      const mod: { default?: Plugin; plugin?: Plugin } = await import(path);
      const plugin = mod.default ?? mod.plugin;
      if (!plugin || typeof plugin.register !== "function") {
        throw new PluginError(`Module "${spec}" does not export a valid Plugin`);
      }
      return plugin;
    }

    // npm package
    const mod: { default?: Plugin; plugin?: Plugin } = await import(spec);
    const plugin = mod.default ?? mod.plugin;
    if (!plugin || typeof plugin.register !== "function") {
      throw new PluginError(`Package "${spec}" does not export a valid Plugin`);
    }
    return plugin;
  } catch (err) {
    if (err instanceof PluginError) throw err;
    throw new PluginError(
      `Failed to load plugin "${spec}": ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

function safeReaddir(dir: string): string[] {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}
