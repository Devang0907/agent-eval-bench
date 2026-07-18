import { z } from "zod";

/** All telemetry event types */
export const TelemetryEventTypeSchema = z.enum([
  "run.started",
  "run.completed",
  "run.failed",
  "benchmark.started",
  "benchmark.completed",
  "benchmark.failed",
  "benchmark.skipped",
  "prompt.sent",
  "response.received",
  "tool.call",
  "tool.result",
  "file.edit",
  "file.create",
  "file.delete",
  "shell.exec",
  "shell.exit",
  "git.op",
  "retry",
  "interrupt",
  "resume",
  "loop.detected",
  "progress",
  "cost",
  "token.usage",
  "sandbox.created",
  "sandbox.destroyed",
  "validator.result",
  "score.computed",
  "adapter.log",
  "error",
]);
export type TelemetryEventType = z.infer<typeof TelemetryEventTypeSchema>;

export const TelemetryEventSchema = z.object({
  id: z.string(),
  type: TelemetryEventTypeSchema,
  timestamp: z.number(),
  runId: z.string(),
  benchmarkId: z.string().optional(),
  agentName: z.string().optional(),
  data: z.record(z.unknown()).default({}),
  durationMs: z.number().optional(),
});
export type TelemetryEvent = z.infer<typeof TelemetryEventSchema>;
