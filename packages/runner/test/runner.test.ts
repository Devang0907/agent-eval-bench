import { describe, it, expect } from "bun:test";
import {
  Registry,
  EventBus,
  BenchmarkDefinitionSchema,
  type AgentEvalBenchConfig,
} from "@agent-eval-bench/core";
import { registerBuiltinSandboxes } from "@agent-eval-bench/sandbox";
import { registerBuiltinAdapters } from "@agent-eval-bench/adapters";
import { registerBuiltinValidators, registerBuiltinScorer } from "@agent-eval-bench/scoring";
import { BenchmarkRunner } from "../src/runner.js";
import { mapConcurrent } from "../src/queue.js";

describe("mapConcurrent", () => {
  it("respects concurrency", async () => {
    let active = 0;
    let maxActive = 0;
    const results = await mapConcurrent([1, 2, 3, 4, 5], 2, async (n) => {
      active++;
      maxActive = Math.max(maxActive, active);
      await Bun.sleep(20);
      active--;
      return n * 2;
    });
    expect(results).toEqual([2, 4, 6, 8, 10]);
    expect(maxActive).toBeLessThanOrEqual(2);
  });
});

describe("BenchmarkRunner", () => {
  it("runs a file-exists benchmark with MockAdapter", async () => {
    const registry = new Registry();
    registerBuiltinSandboxes(registry);
    registerBuiltinAdapters(registry);
    registerBuiltinValidators(registry);
    registerBuiltinScorer(registry);

    registry.registerBenchmark(
      BenchmarkDefinitionSchema.parse({
        id: "filesystem/create-hello",
        name: "Create hello.txt",
        description: "Agent should create hello.txt",
        category: "filesystem",
        difficulty: "easy",
        prompt: "Please create a file called hello.txt with content hello",
        repository: { files: {} },
        expected: {
          files: [{ path: "hello.txt", exists: true }],
        },
        validators: [{ name: "file-exists", params: { path: "hello.txt" } }],
      }),
    );

    const config: AgentEvalBenchConfig = {
      agents: [
        {
          name: "mock",
          type: "mock",
          options: {
            script: [
              { type: "write", path: "hello.txt", content: "hello" },
              { type: "respond", content: "Created hello.txt" },
            ],
          },
        },
      ],
      suites: [],
      benchmarks: [],
      plugins: [],
      noDocker: true,
      outputDir: ".agent-eval-bench",
      database: ".agent-eval-bench/test.sqlite",
      concurrency: 1,
      failFast: false,
      reports: ["json"],
      verbose: false,
      retries: 0,
    };

    const bus = new EventBus();
    const runner = new BenchmarkRunner({ registry, bus, config });
    const result = await runner.run({ suites: ["filesystem"] });

    expect(result.results).toHaveLength(1);
    expect(result.results[0]?.passed).toBe(true);
    expect(result.scoreCard.overall).toBeGreaterThan(0);
  }, 60_000);
});
