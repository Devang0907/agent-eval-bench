import type { EventBus } from "@agent-eval-bench/core";
import { TelemetryCollector } from "./collector.js";
import { JsonlSink } from "./sinks/jsonl.js";
import { openDatabase, SqliteSink, LeaderboardRepository } from "./db/repositories.js";

export { TelemetryCollector } from "./collector.js";
export { JsonlSink } from "./sinks/jsonl.js";
export { openDatabase, SqliteSink, LeaderboardRepository, migrate } from "./db/repositories.js";

export interface TelemetryBundle {
  collector: TelemetryCollector;
  jsonl?: JsonlSink;
  sqlite?: SqliteSink;
  leaderboard?: LeaderboardRepository;
  stop: () => Promise<void>;
}

export function createTelemetry(
  bus: EventBus,
  opts?: {
    jsonlPath?: string;
    sqlitePath?: string;
  },
): TelemetryBundle {
  const collector = new TelemetryCollector(bus);
  collector.start();

  let jsonl: JsonlSink | undefined;
  let sqlite: SqliteSink | undefined;
  let leaderboard: LeaderboardRepository | undefined;

  if (opts?.jsonlPath) {
    jsonl = new JsonlSink(bus, opts.jsonlPath);
    void jsonl.start();
  }

  if (opts?.sqlitePath) {
    const db = openDatabase(opts.sqlitePath);
    sqlite = new SqliteSink(bus, db);
    sqlite.start();
    leaderboard = new LeaderboardRepository(db);
  }

  return {
    collector,
    jsonl,
    sqlite,
    leaderboard,
    async stop() {
      collector.stop();
      sqlite?.stop();
      await jsonl?.stop();
    },
  };
}
