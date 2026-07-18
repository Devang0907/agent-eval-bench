import type { AnyTelemetryEvent, RunMetrics } from "@agent-eval-bench/core";
import { emptyRunMetrics } from "@agent-eval-bench/core";

/** Folds a stream of telemetry events into aggregate {@link RunMetrics}. */
export function computeMetrics(events: AnyTelemetryEvent[]): RunMetrics {
  const metrics = emptyRunMetrics();
  for (const event of events) {
    switch (event.type) {
      case "prompt.sent":
        metrics.promptCount += 1;
        break;
      case "response.received":
        metrics.latencyMs += event.payload.latencyMs;
        metrics.inputTokens += event.payload.inputTokens ?? 0;
        metrics.outputTokens += event.payload.outputTokens ?? 0;
        metrics.costUsd += event.payload.costUsd ?? 0;
        break;
      case "tool.call":
        metrics.toolCalls += 1;
        break;
      case "shell.exec":
        metrics.shellCommands += 1;
        break;
      case "file.edit":
        metrics.fileEdits += 1;
        break;
      case "git.op":
        metrics.gitOperations += 1;
        break;
      case "retry":
        metrics.retries += 1;
        break;
      case "failure":
        metrics.failures += 1;
        break;
      case "interrupt":
        metrics.interruptions += 1;
        break;
      case "loop.detected":
        metrics.loopsDetected += 1;
        break;
      default:
        break;
    }
  }
  return metrics;
}
