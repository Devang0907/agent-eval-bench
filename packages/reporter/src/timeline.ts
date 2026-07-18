import type { RunResult, TelemetryEvent } from "@agent-eval-bench/core";
import { formatMs } from "./format.js";

export interface TimelineEntry {
  timestamp: number;
  type: string;
  label: string;
  benchmarkId?: string;
}

export function buildTimeline(
  events: readonly TelemetryEvent[],
  limit = 200,
): TimelineEntry[] {
  return events.slice(0, limit).map((e) => ({
    timestamp: e.timestamp,
    type: e.type,
    label: summarizeEvent(e),
    benchmarkId: e.benchmarkId,
  }));
}

function summarizeEvent(e: TelemetryEvent): string {
  switch (e.type) {
    case "prompt.sent":
      return `Prompt: ${String(e.data["content"] ?? "").slice(0, 80)}`;
    case "response.received":
      return `Response (${formatMs(e.durationMs ?? 0)})`;
    case "tool.call":
      return `Tool: ${String(e.data["name"] ?? "")}`;
    case "benchmark.completed":
      return `✓ ${e.benchmarkId}`;
    case "benchmark.failed":
      return `✗ ${e.benchmarkId}: ${String(e.data["error"] ?? "")}`;
    default:
      return e.type;
  }
}

export function timelineMarkdown(entries: TimelineEntry[]): string {
  if (entries.length === 0) return "_No timeline events._\n";
  const start = entries[0]!.timestamp;
  const lines = entries.map((e) => {
    const t = formatMs(e.timestamp - start);
    return `- \`+${t}\` **${e.type}** — ${e.label}`;
  });
  return lines.join("\n") + "\n";
}

export function runSummaryLines(result: RunResult): string[] {
  const passed = result.results.filter((r) => r.passed && !r.skipped).length;
  const failed = result.results.filter((r) => !r.passed && !r.skipped).length;
  const skipped = result.results.filter((r) => r.skipped).length;
  return [
    `Agent: ${result.agentName}`,
    `Run: ${result.runId}`,
    `Status: ${result.status}`,
    `Overall: ${result.scoreCard.overall.toFixed(1)}`,
    `Passed: ${passed}  Failed: ${failed}  Skipped: ${skipped}`,
    `Duration: ${formatMs(result.completedAt - result.startedAt)}`,
  ];
}
