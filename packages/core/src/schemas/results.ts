import { z } from "zod";
import { ScoreCardSchema, createEmptyScoreCard, type ScoreCard } from "./score.js";
import { CategorySchema, DifficultySchema } from "./benchmark.js";

/** Aggregated metrics collected during a single benchmark run */
export const RunMetricsSchema = z.object({
  promptTokens: z.number().default(0),
  completionTokens: z.number().default(0),
  totalTokens: z.number().default(0),
  costUsd: z.number().default(0),
  latencyMs: z.number().default(0),
  toolCalls: z.number().default(0),
  shellCommands: z.number().default(0),
  fileEdits: z.number().default(0),
  gitOps: z.number().default(0),
  retries: z.number().default(0),
  loopCount: z.number().default(0),
  interrupts: z.number().default(0),
  contextSize: z.number().default(0),
});
export type RunMetrics = z.infer<typeof RunMetricsSchema>;

export function emptyRunMetrics(): RunMetrics {
  return RunMetricsSchema.parse({});
}

/** Result of a single benchmark execution */
export const BenchmarkRunResultSchema = z.object({
  benchmarkId: z.string(),
  name: z.string(),
  category: CategorySchema,
  difficulty: DifficultySchema,
  agentName: z.string(),
  passed: z.boolean(),
  scoreCard: ScoreCardSchema,
  metrics: RunMetricsSchema,
  durationMs: z.number(),
  error: z.string().optional(),
  skipped: z.boolean().default(false),
  skipReason: z.string().optional(),
  validatorResults: z
    .array(
      z.object({
        name: z.string(),
        passed: z.boolean(),
        score: z.number(),
        message: z.string(),
      }),
    )
    .default([]),
});
export type BenchmarkRunResult = z.infer<typeof BenchmarkRunResultSchema>;

/** Full suite run result */
export const RunResultSchema = z.object({
  runId: z.string(),
  agentName: z.string(),
  agentVersion: z.string().optional(),
  startedAt: z.number(),
  completedAt: z.number(),
  results: z.array(BenchmarkRunResultSchema),
  scoreCard: ScoreCardSchema,
  metrics: RunMetricsSchema,
  status: z.enum(["completed", "failed", "partial", "cancelled"]).default("completed"),
});
export type RunResult = z.infer<typeof RunResultSchema>;

export function aggregateScoreCard(results: BenchmarkRunResult[]): ScoreCard {
  const scored = results.filter((r) => !r.skipped);
  if (scored.length === 0) return createEmptyScoreCard();

  const dims = [
    "success",
    "accuracy",
    "planning",
    "efficiency",
    "verification",
    "recovery",
    "memory",
    "safety",
    "overall",
  ] as const;

  const card = createEmptyScoreCard();
  for (const dim of dims) {
    const sum = scored.reduce((acc, r) => acc + r.scoreCard[dim], 0);
    card[dim] = Math.round((sum / scored.length) * 100) / 100;
  }
  return card;
}

export function aggregateMetrics(results: BenchmarkRunResult[]): RunMetrics {
  const m = emptyRunMetrics();
  for (const r of results) {
    m.promptTokens += r.metrics.promptTokens;
    m.completionTokens += r.metrics.completionTokens;
    m.totalTokens += r.metrics.totalTokens;
    m.costUsd += r.metrics.costUsd;
    m.latencyMs += r.metrics.latencyMs;
    m.toolCalls += r.metrics.toolCalls;
    m.shellCommands += r.metrics.shellCommands;
    m.fileEdits += r.metrics.fileEdits;
    m.gitOps += r.metrics.gitOps;
    m.retries += r.metrics.retries;
    m.loopCount += r.metrics.loopCount;
    m.interrupts += r.metrics.interrupts;
    m.contextSize = Math.max(m.contextSize, r.metrics.contextSize);
  }
  return m;
}
