import type { EventBus, RunResult, TelemetryEvent } from "@agent-eval-bench/core";
import { openDatabase, migrate, type SqliteDatabase } from "./driver.js";

export { openDatabase, migrate } from "./driver.js";

export class SqliteSink {
  private unsubscribe: (() => void) | null = null;

  constructor(
    private readonly bus: EventBus,
    private readonly db: SqliteDatabase,
  ) {}

  start(): void {
    const insert = this.db.prepare(
      `INSERT OR REPLACE INTO events (id, run_id, benchmark_id, type, timestamp, payload)
       VALUES ($id, $run_id, $benchmark_id, $type, $timestamp, $payload)`,
    );
    this.unsubscribe = this.bus.on("*", (event: TelemetryEvent) => {
      insert.run({
        $id: event.id,
        $run_id: event.runId,
        $benchmark_id: event.benchmarkId ?? null,
        $type: event.type,
        $timestamp: event.timestamp,
        $payload: JSON.stringify(event),
      });
    });
  }

  stop(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }
}

export class LeaderboardRepository {
  constructor(private readonly db: SqliteDatabase) {}

  saveRun(result: RunResult): void {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO runs
         (run_id, agent_name, agent_version, started_at, completed_at, overall_score, status, payload)
         VALUES ($run_id, $agent_name, $agent_version, $started_at, $completed_at, $overall_score, $status, $payload)`,
      )
      .run({
        $run_id: result.runId,
        $agent_name: result.agentName,
        $agent_version: result.agentVersion ?? null,
        $started_at: result.startedAt,
        $completed_at: result.completedAt,
        $overall_score: result.scoreCard.overall,
        $status: result.status,
        $payload: JSON.stringify(result),
      });

    const insert = this.db.prepare(
      `INSERT INTO leaderboard
       (agent_name, agent_version, benchmark_id, category, score, passed, run_id, created_at)
       VALUES ($agent_name, $agent_version, $benchmark_id, $category, $score, $passed, $run_id, $created_at)`,
    );

    for (const r of result.results) {
      if (r.skipped) continue;
      insert.run({
        $agent_name: result.agentName,
        $agent_version: result.agentVersion ?? null,
        $benchmark_id: r.benchmarkId,
        $category: r.category,
        $score: r.scoreCard.overall,
        $passed: r.passed ? 1 : 0,
        $run_id: result.runId,
        $created_at: result.completedAt,
      });
    }
  }

  getRun(runId: string): RunResult | null {
    const row = this.db
      .prepare(`SELECT payload FROM runs WHERE run_id = ?`)
      .get(runId) as { payload: string } | null;
    if (!row) return null;
    return JSON.parse(row.payload) as RunResult;
  }

  listRuns(limit = 50): Array<{
    runId: string;
    agentName: string;
    overallScore: number;
    completedAt: number;
  }> {
    return this.db
      .prepare(
        `SELECT run_id as runId, agent_name as agentName, overall_score as overallScore, completed_at as completedAt
         FROM runs ORDER BY completed_at DESC LIMIT ?`,
      )
      .all(limit) as Array<{
      runId: string;
      agentName: string;
      overallScore: number;
      completedAt: number;
    }>;
  }

  rankings(opts?: { category?: string; limit?: number }): Array<{
    agentName: string;
    avgScore: number;
    runs: number;
  }> {
    const limit = opts?.limit ?? 20;
    if (opts?.category) {
      return this.db
        .prepare(
          `SELECT agent_name as agentName, AVG(score) as avgScore, COUNT(*) as runs
           FROM leaderboard WHERE category = ?
           GROUP BY agent_name ORDER BY avgScore DESC LIMIT ?`,
        )
        .all(opts.category, limit) as Array<{
        agentName: string;
        avgScore: number;
        runs: number;
      }>;
    }
    return this.db
      .prepare(
        `SELECT agent_name as agentName, AVG(score) as avgScore, COUNT(*) as runs
         FROM leaderboard
         GROUP BY agent_name ORDER BY avgScore DESC LIMIT ?`,
      )
      .all(limit) as Array<{ agentName: string; avgScore: number; runs: number }>;
  }

  compare(agentA: string, agentB: string): Array<{
    benchmarkId: string;
    scoreA: number | null;
    scoreB: number | null;
  }> {
    return this.db
      .prepare(
        `SELECT benchmark_id as benchmarkId,
                MAX(CASE WHEN agent_name = ? THEN score END) as scoreA,
                MAX(CASE WHEN agent_name = ? THEN score END) as scoreB
         FROM leaderboard
         WHERE agent_name IN (?, ?)
         GROUP BY benchmark_id
         ORDER BY benchmark_id`,
      )
      .all(agentA, agentB, agentA, agentB) as Array<{
      benchmarkId: string;
      scoreA: number | null;
      scoreB: number | null;
    }>;
  }
}
