import type { EventBus, TelemetryEvent } from "@agent-eval-bench/core";

/**
 * Detects repeated identical tool/shell patterns that indicate an infinite loop.
 */
export class LoopDetector {
  private readonly recent: string[] = [];
  private readonly windowSize: number;
  private readonly threshold: number;

  constructor(
    private readonly bus: EventBus,
    private readonly runId: string,
    opts?: { windowSize?: number; threshold?: number },
  ) {
    this.windowSize = opts?.windowSize ?? 8;
    this.threshold = opts?.threshold ?? 4;
  }

  observe(event: TelemetryEvent): boolean {
    if (
      event.type !== "tool.call" &&
      event.type !== "shell.exec" &&
      event.type !== "file.edit"
    ) {
      return false;
    }

    const key = `${event.type}:${JSON.stringify(event.data)}`;
    this.recent.push(key);
    if (this.recent.length > this.windowSize) {
      this.recent.shift();
    }

    const counts = new Map<string, number>();
    for (const k of this.recent) {
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }

    for (const [pattern, count] of counts) {
      if (count >= this.threshold) {
        this.bus.emit({
          type: "loop.detected",
          runId: this.runId,
          benchmarkId: event.benchmarkId,
          agentName: event.agentName,
          data: { pattern, count },
        });
        return true;
      }
    }
    return false;
  }
}
