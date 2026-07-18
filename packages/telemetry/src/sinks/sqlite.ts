import type { AnyTelemetryEvent, EventBus, Unsubscribe } from "@agent-eval-bench/core";
import type { SqlDriver } from "../db/driver.js";

/** Persists every telemetry event into the `events` table as it happens. */
export class SqliteEventSink {
  private readonly unsubscribe: Unsubscribe;

  constructor(
    private readonly db: SqlDriver,
    bus: EventBus,
  ) {
    this.unsubscribe = bus.onAny((event) => this.insert(event));
  }

  private insert(event: AnyTelemetryEvent): void {
    this.db.run(
      `INSERT OR IGNORE INTO events (id, run_id, benchmark_id, agent, type, timestamp, payload_json)
       VALUES (:id, :runId, :benchmarkId, :agent, :type, :timestamp, :payload)`,
      {
        id: event.id,
        runId: event.runId,
        benchmarkId: event.benchmarkId ?? null,
        agent: event.agent ?? null,
        type: event.type,
        timestamp: event.timestamp,
        payload: JSON.stringify(event.payload),
      },
    );
  }

  close(): void {
    this.unsubscribe();
  }
}
