import { describe, it, expect } from "vitest";
import {
  BenchmarkDefinitionSchema,
  CategorySchema,
} from "../schemas/benchmark.js";
import { ScoreCardSchema, createEmptyScoreCard } from "../schemas/score.js";
import { AgentEvalBenchConfigSchema } from "../schemas/config.js";
import { defineConfig } from "../config/loader.js";

describe("schemas", () => {
  it("parses a minimal benchmark definition", () => {
    const b = BenchmarkDefinitionSchema.parse({
      id: "context/forgotten",
      name: "Forgotten Instructions",
      description: "Agent forgets early instructions",
      category: "context",
      prompt: "Do X. Later: what was X?",
    });
    expect(b.difficulty).toBe("medium");
    expect(b.validators).toEqual([]);
    expect(b.skip).toBe(false);
  });

  it("rejects invalid category", () => {
    expect(() => CategorySchema.parse("invalid")).toThrow();
  });

  it("creates empty score card", () => {
    const card = createEmptyScoreCard();
    expect(ScoreCardSchema.parse(card).overall).toBe(0);
  });

  it("parses config with defaults", () => {
    const cfg = AgentEvalBenchConfigSchema.parse({
      agents: [{ name: "claude", type: "claude-code" }],
    });
    expect(cfg.concurrency).toBe(1);
    expect(cfg.outputDir).toBe(".agent-eval-bench");
    expect(cfg.reports).toContain("terminal");
  });

  it("defineConfig validates", () => {
    const cfg = defineConfig({
      agents: [{ name: "mock", type: "custom" }],
      suites: ["context"],
      plugins: [],
      noDocker: true,
      outputDir: ".agent-eval-bench",
      database: ".agent-eval-bench/db.sqlite",
      concurrency: 1,
      failFast: false,
      reports: ["json"],
      verbose: false,
      retries: 0,
      benchmarks: [],
    });
    expect(cfg.agents[0]?.name).toBe("mock");
  });
});
