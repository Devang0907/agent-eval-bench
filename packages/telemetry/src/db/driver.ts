import type { Database as BunDatabase } from "bun:sqlite";

export type SqliteDatabase = BunDatabase;

let DatabaseCtor: typeof import("bun:sqlite").Database | null = null;

async function loadDatabase(): Promise<typeof import("bun:sqlite").Database> {
  if (!DatabaseCtor) {
    const mod = await import("bun:sqlite");
    DatabaseCtor = mod.Database;
  }
  return DatabaseCtor;
}

export function openDatabaseSync(path: string): BunDatabase {
  // Synchronous open — requires bun runtime
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Database } = require("bun:sqlite") as typeof import("bun:sqlite");
  const { mkdirSync } = require("node:fs") as typeof import("node:fs");
  const { dirname } = require("node:path") as typeof import("node:path");
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path, { create: true });
  db.exec("PRAGMA journal_mode = WAL;");
  migrate(db);
  return db;
}

export function openDatabase(path: string): BunDatabase {
  return openDatabaseSync(path);
}

export function migrate(db: BunDatabase): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS runs (
      run_id TEXT PRIMARY KEY,
      agent_name TEXT NOT NULL,
      agent_version TEXT,
      started_at INTEGER NOT NULL,
      completed_at INTEGER NOT NULL,
      overall_score REAL NOT NULL,
      status TEXT NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL,
      benchmark_id TEXT,
      type TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      payload TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS leaderboard (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_name TEXT NOT NULL,
      agent_version TEXT,
      benchmark_id TEXT NOT NULL,
      category TEXT NOT NULL,
      score REAL NOT NULL,
      passed INTEGER NOT NULL,
      run_id TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_leaderboard_agent ON leaderboard(agent_name, score DESC);
    CREATE INDEX IF NOT EXISTS idx_leaderboard_bench ON leaderboard(benchmark_id, score DESC);
    CREATE INDEX IF NOT EXISTS idx_events_run ON events(run_id);
  `);
}

export { loadDatabase };
