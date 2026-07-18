import type { AgentAdapter, AdapterFactory } from "./adapter.js";
import type { Validator, Scorer } from "./scoring.js";
import type { SandboxProvider } from "./sandbox.js";
import type { BenchmarkDefinition } from "../schemas/benchmark.js";
import type { AdapterConfig } from "../schemas/adapter.js";
import type { Registry } from "../registry/registry.js";

/** Reporter that renders run results */
export interface Reporter {
  readonly name: string;
  readonly formats: readonly ("markdown" | "html" | "json" | "terminal")[];
  report(data: ReportData, format: string, outputPath: string): Promise<string>;
}

export interface ReportData {
  runId: string;
  agentName: string;
  startedAt: number;
  completedAt: number;
  results: BenchmarkResultSummary[];
  scoreCard: import("../schemas/score.js").ScoreCard;
}

export interface BenchmarkResultSummary {
  benchmarkId: string;
  name: string;
  category: string;
  difficulty: string;
  passed: boolean;
  scoreCard: import("../schemas/score.js").ScoreCard;
  durationMs: number;
  error?: string;
}

/**
 * Plugin contract — community packages implement this to register
 * new suites, validators, adapters, reporters, and sandbox providers.
 */
export interface Plugin {
  readonly name: string;
  readonly version?: string;
  register(registry: Registry): void | Promise<void>;
}

export type { AgentAdapter, AdapterFactory, Validator, Scorer, SandboxProvider, AdapterConfig, BenchmarkDefinition };
