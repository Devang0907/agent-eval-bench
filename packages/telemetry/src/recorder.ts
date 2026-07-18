import type {
  AnyTelemetryEvent,
  EventBus,
  TelemetryEventType,
  TelemetryPayload,
  TelemetryRecorder,
} from "@agent-eval-bench/core";
import { uniqueId } from "@agent-eval-bench/core";

export interface RecorderContext {
  runId: string;
  benchmarkId?: string;
  agent?: string;
}

/**
 * Creates a {@link TelemetryRecorder} bound to a run/benchmark/agent context.
 * Producers only supply the event type and payload; the recorder stamps
 * identifiers and timestamps and publishes to the bus.
 */
export function createRecorder(bus: EventBus, context: RecorderContext): TelemetryRecorder {
  return {
    record<T extends TelemetryEventType>(type: T, payload: TelemetryPayload<T>): void {
      bus.publish({
        id: uniqueId(),
        runId: context.runId,
        ...(context.benchmarkId !== undefined ? { benchmarkId: context.benchmarkId } : {}),
        ...(context.agent !== undefined ? { agent: context.agent } : {}),
        type,
        timestamp: Date.now(),
        payload,
      } as AnyTelemetryEvent);
    },
  };
}
