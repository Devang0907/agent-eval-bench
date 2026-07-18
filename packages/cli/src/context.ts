import {
  Registry,
  EventBus,
  loadConfig,
  loadPlugins,
  loadBenchmarksFromDir,
  type AgentEvalBenchConfig,
} from "@agent-eval-bench/core";
import { registerBuiltinSandboxes } from "@agent-eval-bench/sandbox";
import { registerBuiltinAdapters } from "@agent-eval-bench/adapters";
import { registerBuiltinValidators, registerBuiltinScorer } from "@agent-eval-bench/scoring";
import { registerBuiltinReporters } from "@agent-eval-bench/reporter";
import { loadOfficialBenchmarks } from "@agent-eval-bench/benchmarks";
import { join } from "node:path";

export interface AppContext {
  cwd: string;
  config: AgentEvalBenchConfig;
  registry: Registry;
  bus: EventBus;
}

export async function createAppContext(opts?: {
  cwd?: string;
  configPath?: string;
}): Promise<AppContext> {
  const cwd = opts?.cwd ?? process.cwd();
  const config = await loadConfig(cwd, opts?.configPath);
  const registry = new Registry();
  const bus = new EventBus();

  registerBuiltinSandboxes(registry, { preferDocker: !config.noDocker });
  registerBuiltinAdapters(registry);
  registerBuiltinValidators(registry);
  registerBuiltinScorer(registry);
  registerBuiltinReporters(registry);

  const official = await loadOfficialBenchmarks();
  registry.registerBenchmarks(official);

  for (const pattern of config.benchmarks) {
    const dir = join(cwd, pattern.replace(/\*\*.*$/, "").replace(/\/$/, "") || ".");
    try {
      const extra = await loadBenchmarksFromDir(dir);
      registry.registerBenchmarks(extra);
    } catch {
      // skip missing dirs
    }
  }

  await loadPlugins(registry, { cwd, explicit: config.plugins });

  return { cwd, config, registry, bus };
}
