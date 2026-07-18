import type { SqlDriver } from "./driver.js";

/**
 * Storage schema. `runs` and `benchmark_results` power the leaderboard and
 * `report`/`compare`; `events` retains the full telemetry stream so reports
 * (timelines) can be regenerated at any time.
 */
const SCHEMA = `
CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  agent TEXT NOT NULL,
  agent_version TEXT,
  sandbox TEXT NOT NULL,
  suites TEXT NOT NULL,
  official INTEGER NOT NULL DEFAULT 0,
  started_at INTEGER NOT NULL,
  finished_at INTEGER NOT NULL,
  overall REAL NOT NULL,
  succeeded INTEGER NOT NULL,
  failed INTEGER NOT NULL,
  skipped INTEGER NOT NULL,
  total INTEGER NOT NULL,
  total_cost_usd REAL NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  summary_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS benchmark_results (
  run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  benchmark_id TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  success INTEGER NOT NULL,
  overall REAL NOT NULL,
  error TEXT,
  skipped TEXT,
  started_at INTEGER NOT NULL,
  finished_at INTEGER NOT NULL,
  score_json TEXT NOT NULL,
  metrics_json TEXT NOT NULL,
  validators_json TEXT NOT NULL,
  responses_json TEXT NOT NULL,
  benchmark_json TEXT NOT NULL,
  PRIMARY KEY (run_id, benchmark_id)
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  benchmark_id TEXT,
  agent TEXT,
  type TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  payload_json TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_run ON events(run_id, benchmark_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_results_benchmark ON benchmark_results(benchmark_id);
CREATE INDEX IF NOT EXISTS idx_runs_agent ON runs(agent, finished_at);
`;

export function migrate(db: SqlDriver): void {
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
}
