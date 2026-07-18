import { describe, it, expect, beforeEach } from "vitest";
import { Registry } from "../registry/registry.js";
import type { Validator } from "../contracts/scoring.js";
import type { Plugin } from "../contracts/plugin.js";
import { BenchmarkDefinitionSchema } from "../schemas/benchmark.js";

describe("Registry", () => {
  let registry: Registry;

  beforeEach(() => {
    registry = new Registry();
  });

  it("registers and retrieves validators", () => {
    const v: Validator = {
      name: "file-exists",
      description: "Check file exists",
      async validate() {
        return { name: "file-exists", passed: true, score: 100, message: "ok" };
      },
    };
    registry.registerValidator(v);
    expect(registry.getValidator("file-exists")).toBe(v);
    expect(registry.listValidators()).toHaveLength(1);
  });

  it("registers benchmarks and filters by category", () => {
    const b = BenchmarkDefinitionSchema.parse({
      id: "context/basic",
      name: "Basic Context",
      description: "Test",
      category: "context",
      prompt: "Remember this",
    });
    registry.registerBenchmark(b);
    expect(registry.listBenchmarks({ category: "context" })).toHaveLength(1);
    expect(registry.listBenchmarks({ category: "memory" })).toHaveLength(0);
  });

  it("creates adapters from registered factories", () => {
    registry.registerAdapter("custom", (config) => ({
      name: config.name,
      config,
      capabilities: {
        supportsInterrupt: false,
        supportsResume: false,
        supportsMcp: false,
        supportsStreaming: false,
        supportsToolCalls: true,
        supportsMultiTurn: true,
        supportsFiles: true,
        supportsShell: true,
      },
      async initialize() {},
      async sendPrompt() {
        return { content: "ok" };
      },
      async toolCall() {
        return { toolCallId: "1", name: "x", arguments: {} };
      },
      async interrupt() {},
      async resume() {
        return { content: "ok" };
      },
      async shutdown() {},
    }));

    const adapter = registry.createAdapter({ name: "test", type: "custom" });
    expect(adapter.name).toBe("test");
  });

  it("loads plugins", async () => {
    const plugin: Plugin = {
      name: "test-plugin",
      register(reg) {
        reg.registerValidator({
          name: "plugin-validator",
          description: "from plugin",
          async validate() {
            return { name: "plugin-validator", passed: true, score: 100, message: "ok" };
          },
        });
      },
    };
    await registry.registerPlugin(plugin);
    expect(registry.getValidator("plugin-validator").name).toBe("plugin-validator");
    expect(registry.listPlugins()).toHaveLength(1);
  });
});
