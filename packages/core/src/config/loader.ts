import { resolve, join } from "node:path";
import { existsSync } from "node:fs";
import {
  AgentEvalBenchConfigSchema,
  DEFAULT_CONFIG,
  type AgentEvalBenchConfig,
} from "../schemas/config.js";
import { ConfigError } from "../errors/index.js";

const CONFIG_FILES = [
  "agent-eval-bench.config.ts",
  "agent-eval-bench.config.js",
  "agent-eval-bench.config.mjs",
  "agent-eval-bench.config.json",
] as const;

/**
 * Load and validate agent-eval-bench.config.ts (or .js / .json).
 * Uses Bun's native TypeScript import — no transpile step needed.
 */
export async function loadConfig(
  cwd: string = process.cwd(),
  explicitPath?: string,
): Promise<AgentEvalBenchConfig> {
  const path = explicitPath
    ? resolve(cwd, explicitPath)
    : findConfigFile(cwd);

  if (!path) {
    return { ...DEFAULT_CONFIG };
  }

  try {
    let raw: unknown;

    if (path.endsWith(".json")) {
      const text = await Bun.file(path).text();
      raw = JSON.parse(text);
    } else {
      const mod: { default?: unknown } = await import(path);
      raw = mod.default ?? mod;
    }

    // Support `defineConfig(...)` wrapper that returns the config as-is
    if (typeof raw === "function") {
      raw = (raw as () => unknown)();
    }

    const result = AgentEvalBenchConfigSchema.safeParse(raw);
    if (!result.success) {
      throw new ConfigError("Invalid agent-eval-bench config", {
        path,
        issues: result.error.issues,
      });
    }
    return result.data;
  } catch (err) {
    if (err instanceof ConfigError) throw err;
    throw new ConfigError(
      `Failed to load config from ${path}: ${err instanceof Error ? err.message : String(err)}`,
      { path },
    );
  }
}

function findConfigFile(cwd: string): string | null {
  for (const name of CONFIG_FILES) {
    const p = join(cwd, name);
    if (existsSync(p)) return p;
  }
  return null;
}

/** Helper for typed config files — identity function for IDE inference */
export function defineConfig(config: AgentEvalBenchConfig): AgentEvalBenchConfig {
  return AgentEvalBenchConfigSchema.parse(config);
}
