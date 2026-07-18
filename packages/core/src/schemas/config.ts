import { z } from "zod";
import { AdapterConfigSchema } from "./adapter.js";
import { EnvironmentSchema } from "./benchmark.js";

/** Top-level agent-eval-bench.config.ts schema */
export const AgentEvalBenchConfigSchema = z.object({
  /** Agent adapters to evaluate */
  agents: z.array(AdapterConfigSchema).min(1),

  /** Benchmark suites / categories to run (empty = all) */
  suites: z.array(z.string()).default([]),

  /** Glob patterns for additional benchmark files */
  benchmarks: z.array(z.string()).default([]),

  /** Plugin package names or local paths */
  plugins: z.array(z.string()).default([]),

  /** Default sandbox environment overrides */
  sandbox: EnvironmentSchema.partial().optional(),

  /** Prefer local sandbox over Docker */
  noDocker: z.boolean().default(false),

  /** Output directory for reports and telemetry */
  outputDir: z.string().default(".agent-eval-bench"),

  /** SQLite database path for leaderboard */
  database: z.string().default(".agent-eval-bench/leaderboard.sqlite"),

  /** Concurrent benchmark runs */
  concurrency: z.number().int().positive().default(1),

  /** Fail fast on first error */
  failFast: z.boolean().default(false),

  /** Report formats to generate */
  reports: z
    .array(z.enum(["markdown", "html", "json", "terminal"]))
    .default(["terminal", "json", "markdown"]),

  /** Verbose logging */
  verbose: z.boolean().default(false),

  /** Retry failed benchmarks this many times */
  retries: z.number().int().min(0).default(0),
});
export type AgentEvalBenchConfig = z.infer<typeof AgentEvalBenchConfigSchema>;

export const DEFAULT_CONFIG: AgentEvalBenchConfig = AgentEvalBenchConfigSchema.parse({
  agents: [
    {
      name: "mock",
      type: "custom",
    },
  ],
});
