import type { AgentAdapter, AdapterFactory } from "../contracts/adapter.js";
import type { Validator, Scorer } from "../contracts/scoring.js";
import type { SandboxProvider } from "../contracts/sandbox.js";
import type { Reporter, Plugin } from "../contracts/plugin.js";
import type { BenchmarkDefinition } from "../schemas/benchmark.js";
import type { AdapterConfig } from "../schemas/adapter.js";
import { PluginError } from "../errors/index.js";

/**
 * Central registry for adapters, validators, scorers, sandboxes,
 * reporters, benchmarks, and plugins.
 */
export class Registry {
  private readonly adapterFactories = new Map<string, AdapterFactory>();
  private readonly validators = new Map<string, Validator>();
  private readonly scorers = new Map<string, Scorer>();
  private readonly sandboxes = new Map<string, SandboxProvider>();
  private readonly reporters = new Map<string, Reporter>();
  private readonly benchmarks = new Map<string, BenchmarkDefinition>();
  private readonly plugins = new Map<string, Plugin>();
  private defaultScorerName: string | null = null;
  private defaultSandboxName: string | null = null;

  // ── Adapters ──────────────────────────────────────────────

  registerAdapter(type: string, factory: AdapterFactory): void {
    this.adapterFactories.set(type, factory);
  }

  createAdapter(config: AdapterConfig): AgentAdapter {
    const factory = this.adapterFactories.get(config.type);
    if (!factory) {
      throw new PluginError(`No adapter registered for type "${config.type}"`, {
        available: [...this.adapterFactories.keys()],
      });
    }
    return factory(config);
  }

  listAdapterTypes(): string[] {
    return [...this.adapterFactories.keys()];
  }

  // ── Validators ────────────────────────────────────────────

  registerValidator(validator: Validator): void {
    this.validators.set(validator.name, validator);
  }

  getValidator(name: string): Validator {
    const v = this.validators.get(name);
    if (!v) {
      throw new PluginError(`Validator "${name}" not found`, {
        available: [...this.validators.keys()],
      });
    }
    return v;
  }

  listValidators(): Validator[] {
    return [...this.validators.values()];
  }

  // ── Scorers ───────────────────────────────────────────────

  registerScorer(name: string, scorer: Scorer, opts?: { default?: boolean }): void {
    this.scorers.set(name, scorer);
    if (opts?.default || this.defaultScorerName === null) {
      this.defaultScorerName = name;
    }
  }

  getScorer(name?: string): Scorer {
    const key = name ?? this.defaultScorerName;
    if (!key) throw new PluginError("No scorer registered");
    const s = this.scorers.get(key);
    if (!s) throw new PluginError(`Scorer "${key}" not found`);
    return s;
  }

  // ── Sandboxes ─────────────────────────────────────────────

  registerSandbox(provider: SandboxProvider, opts?: { default?: boolean }): void {
    this.sandboxes.set(provider.name, provider);
    if (opts?.default || this.defaultSandboxName === null) {
      this.defaultSandboxName = provider.name;
    }
  }

  getSandbox(name?: string): SandboxProvider {
    const key = name ?? this.defaultSandboxName;
    if (!key) throw new PluginError("No sandbox provider registered");
    const s = this.sandboxes.get(key);
    if (!s) throw new PluginError(`Sandbox "${key}" not found`);
    return s;
  }

  listSandboxes(): string[] {
    return [...this.sandboxes.keys()];
  }

  // ── Reporters ─────────────────────────────────────────────

  registerReporter(reporter: Reporter): void {
    this.reporters.set(reporter.name, reporter);
  }

  getReporter(name: string): Reporter {
    const r = this.reporters.get(name);
    if (!r) throw new PluginError(`Reporter "${name}" not found`);
    return r;
  }

  listReporters(): Reporter[] {
    return [...this.reporters.values()];
  }

  // ── Benchmarks ────────────────────────────────────────────

  registerBenchmark(benchmark: BenchmarkDefinition): void {
    this.benchmarks.set(benchmark.id, benchmark);
  }

  registerBenchmarks(benchmarks: BenchmarkDefinition[]): void {
    for (const b of benchmarks) {
      this.registerBenchmark(b);
    }
  }

  getBenchmark(id: string): BenchmarkDefinition {
    const b = this.benchmarks.get(id);
    if (!b) throw new PluginError(`Benchmark "${id}" not found`);
    return b;
  }

  listBenchmarks(filter?: { category?: string; tags?: string[] }): BenchmarkDefinition[] {
    let list = [...this.benchmarks.values()];
    if (filter?.category) {
      list = list.filter((b) => b.category === filter.category);
    }
    if (filter?.tags && filter.tags.length > 0) {
      const tags = filter.tags;
      list = list.filter((b) => tags.some((t) => b.tags.includes(t)));
    }
    return list;
  }

  // ── Plugins ───────────────────────────────────────────────

  async registerPlugin(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new PluginError(`Plugin "${plugin.name}" already registered`);
    }
    await plugin.register(this);
    this.plugins.set(plugin.name, plugin);
  }

  listPlugins(): Plugin[] {
    return [...this.plugins.values()];
  }
}
