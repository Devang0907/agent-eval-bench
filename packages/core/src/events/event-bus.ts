import { EventEmitter } from "node:events";
import type { TelemetryEvent, TelemetryEventType } from "../schemas/telemetry.js";
import { TelemetryEventSchema } from "../schemas/telemetry.js";

type EventHandler = (event: TelemetryEvent) => void | Promise<void>;

/**
 * Typed event bus backed by EventEmitter.
 * All payloads are Zod-validated before emission.
 */
export class EventBus {
  private readonly emitter = new EventEmitter();
  private readonly history: TelemetryEvent[] = [];
  private readonly maxHistory: number;

  constructor(opts?: { maxHistory?: number; maxListeners?: number }) {
    this.maxHistory = opts?.maxHistory ?? 100_000;
    this.emitter.setMaxListeners(opts?.maxListeners ?? 50);
  }

  emit(event: Omit<TelemetryEvent, "id" | "timestamp"> & { id?: string; timestamp?: number }): TelemetryEvent {
    const full: TelemetryEvent = TelemetryEventSchema.parse({
      id: event.id ?? crypto.randomUUID(),
      timestamp: event.timestamp ?? Date.now(),
      type: event.type,
      runId: event.runId,
      benchmarkId: event.benchmarkId,
      agentName: event.agentName,
      data: event.data ?? {},
      durationMs: event.durationMs,
    });

    this.history.push(full);
    if (this.history.length > this.maxHistory) {
      this.history.splice(0, this.history.length - this.maxHistory);
    }

    // Prefix event names so they never collide with EventEmitter's reserved "error"
    const channel = `ab:${full.type}`;
    this.emitter.emit(channel, full);
    this.emitter.emit("ab:*", full);
    return full;
  }

  on(type: TelemetryEventType | "*", handler: EventHandler): () => void {
    const channel = `ab:${type}`;
    this.emitter.on(channel, handler);
    return () => {
      this.emitter.off(channel, handler);
    };
  }

  once(type: TelemetryEventType | "*", handler: EventHandler): () => void {
    const channel = `ab:${type}`;
    this.emitter.once(channel, handler);
    return () => {
      this.emitter.off(channel, handler);
    };
  }

  off(type: TelemetryEventType | "*", handler: EventHandler): void {
    this.emitter.off(`ab:${type}`, handler);
  }

  getHistory(filter?: {
    type?: TelemetryEventType;
    benchmarkId?: string;
    runId?: string;
  }): readonly TelemetryEvent[] {
    if (!filter) return this.history;
    return this.history.filter((e) => {
      if (filter.type && e.type !== filter.type) return false;
      if (filter.benchmarkId && e.benchmarkId !== filter.benchmarkId) return false;
      if (filter.runId && e.runId !== filter.runId) return false;
      return true;
    });
  }

  clear(): void {
    this.history.length = 0;
  }

  removeAllListeners(): void {
    this.emitter.removeAllListeners();
  }
}
