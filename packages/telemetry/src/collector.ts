import type { EventBus, RunMetrics, TelemetryEvent } from "@agent-eval-bench/core";
import { emptyRunMetrics } from "@agent-eval-bench/core";

/**
 * Subscribes to EventBus and accumulates RunMetrics + event list.
 */
export class TelemetryCollector {
  private readonly events: TelemetryEvent[] = [];
  private metrics: RunMetrics = emptyRunMetrics();
  private unsubscribe: (() => void) | null = null;

  constructor(private readonly bus: EventBus) {}

  start(): void {
    this.unsubscribe = this.bus.on("*", (event) => {
      this.events.push(event);
      this.apply(event);
    });
  }

  stop(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  getEvents(filter?: { benchmarkId?: string }): readonly TelemetryEvent[] {
    if (!filter?.benchmarkId) return this.events;
    return this.events.filter((e) => e.benchmarkId === filter.benchmarkId);
  }

  getMetrics(): RunMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.events.length = 0;
    this.metrics = emptyRunMetrics();
  }

  private apply(event: TelemetryEvent): void {
    const d = event.data;
    switch (event.type) {
      case "token.usage":
        this.metrics.promptTokens += Number(d["promptTokens"] ?? 0);
        this.metrics.completionTokens += Number(d["completionTokens"] ?? 0);
        this.metrics.totalTokens += Number(d["totalTokens"] ?? 0);
        break;
      case "cost":
        this.metrics.costUsd += Number(d["costUsd"] ?? 0);
        break;
      case "tool.call":
        this.metrics.toolCalls += 1;
        break;
      case "shell.exec":
        this.metrics.shellCommands += 1;
        break;
      case "file.edit":
      case "file.create":
        this.metrics.fileEdits += 1;
        break;
      case "git.op":
        this.metrics.gitOps += 1;
        break;
      case "retry":
        this.metrics.retries += 1;
        break;
      case "loop.detected":
        this.metrics.loopCount += 1;
        break;
      case "interrupt":
        this.metrics.interrupts += 1;
        break;
      case "response.received":
        if (event.durationMs) this.metrics.latencyMs += event.durationMs;
        break;
      default:
        break;
    }
    if (typeof d["contextSize"] === "number") {
      this.metrics.contextSize = Math.max(this.metrics.contextSize, d["contextSize"]);
    }
  }
}
