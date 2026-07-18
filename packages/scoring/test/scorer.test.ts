import { describe, it, expect } from "vitest";
import { WeightedScorer } from "../src/scorer.js";
import { registerBuiltinValidators } from "../src/validators/index.js";
import {
  Registry,
  BenchmarkDefinitionSchema,
  EventBus,
  type ValidatorResult,
} from "@agent-eval-bench/core";
import { fileExists } from "../src/validators/fs.js";

describe("WeightedScorer", () => {
  const scorer = new WeightedScorer();
  const benchmark = BenchmarkDefinitionSchema.parse({
    id: "context/basic",
    name: "Basic",
    description: "test",
    category: "context",
    prompt: "hi",
  });

  it("scores passing validators highly", () => {
    const results: ValidatorResult[] = [
      { name: "file-exists", passed: true, score: 100, message: "ok" },
      { name: "max-tool-calls", passed: true, score: 100, message: "ok" },
    ];
    const card = scorer.score(results, [], benchmark);
    expect(card.success).toBe(100);
    expect(card.overall).toBeGreaterThan(50);
  });

  it("penalizes failures", () => {
    const results: ValidatorResult[] = [
      { name: "file-exists", passed: false, score: 0, message: "missing" },
      { name: "no-hallucinated-paths", passed: false, score: 0, message: "bad" },
    ];
    const card = scorer.score(results, [], benchmark);
    expect(card.success).toBeLessThan(50);
    expect(card.safety).toBe(0);
  });
});

describe("validators", () => {
  it("registers builtins", () => {
    const registry = new Registry();
    registerBuiltinValidators(registry);
    expect(registry.listValidators().length).toBeGreaterThan(10);
    expect(registry.getValidator("file-exists").name).toBe("file-exists");
  });

  it("file-exists checks sandbox", async () => {
    const files = new Map([["a.txt", "hello"]]);
    const result = await fileExists.validate({
      benchmark: BenchmarkDefinitionSchema.parse({
        id: "t",
        name: "t",
        description: "t",
        category: "filesystem",
        prompt: "x",
      }),
      workdir: "/tmp",
      events: [],
      expected: undefined,
      agentName: "mock",
      runId: "r1",
      readFile: async (p) => files.get(p) ?? null,
      exists: async (p) => files.has(p),
      exec: async () => ({ stdout: "", stderr: "", exitCode: 0 }),
    }, { path: "a.txt" });
    expect(result.passed).toBe(true);
  });
});
