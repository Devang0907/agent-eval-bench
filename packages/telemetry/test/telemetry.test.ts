import { describe, it, expect, afterEach } from "bun:test";
import { EventBus, createEmptyScoreCard, emptyRunMetrics, type RunResult } from "@agent-eval-bench/core";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createTelemetry, openDatabase, LeaderboardRepository } from "../src/index.js";

describe("TelemetryCollector", () => {
  it("accumulates metrics from events", async () => {
    const bus = new EventBus();
    const t = createTelemetry(bus);
    bus.emit({ type: "tool.call", runId: "r1", data: { name: "shell" } });
    bus.emit({ type: "shell.exec", runId: "r1", data: { cmd: "ls" } });
    bus.emit({
      type: "token.usage",
      runId: "r1",
      data: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
    });
    const m = t.collector.getMetrics();
    expect(m.toolCalls).toBe(1);
    expect(m.shellCommands).toBe(1);
    expect(m.totalTokens).toBe(15);
    await t.stop();
  });
});

describe("LeaderboardRepository", () => {
  let dir: string;
  let db: ReturnType<typeof openDatabase> | null = null;

  afterEach(() => {
    try {
      db?.close();
    } catch {
      // ignore
    }
    db = null;
    if (dir) {
      try {
        rmSync(dir, { recursive: true, force: true });
      } catch {
        // Windows may briefly lock WAL files
      }
    }
  });

  it("stores runs and rankings", () => {
    dir = mkdtempSync(join(tmpdir(), "ab-tel-"));
    db = openDatabase(join(dir, "lb.sqlite"));
    const repo = new LeaderboardRepository(db);

    const result: RunResult = {
      runId: "run-1",
      agentName: "mock",
      startedAt: Date.now() - 1000,
      completedAt: Date.now(),
      results: [
        {
          benchmarkId: "context/basic",
          name: "Basic",
          category: "context",
          difficulty: "easy",
          agentName: "mock",
          passed: true,
          scoreCard: { ...createEmptyScoreCard(), overall: 90, success: 100 },
          metrics: emptyRunMetrics(),
          durationMs: 100,
          skipped: false,
          validatorResults: [],
        },
      ],
      scoreCard: { ...createEmptyScoreCard(), overall: 90 },
      metrics: emptyRunMetrics(),
      status: "completed",
    };

    repo.saveRun(result);
    expect(repo.getRun("run-1")?.agentName).toBe("mock");
    const ranks = repo.rankings();
    expect(ranks[0]?.agentName).toBe("mock");
    expect(ranks[0]?.avgScore).toBe(90);
  });
});
