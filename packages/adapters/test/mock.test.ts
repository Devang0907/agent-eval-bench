import { describe, it, expect } from "vitest";
import { MockAdapter } from "../src/mock.js";
import { assertAdapterContract, createTestContext, mockConfig, FakeSandbox } from "../src/testing.js";
import { registerBuiltinAdapters } from "../src/index.js";
import { Registry } from "@agent-eval-bench/core";

describe("MockAdapter", () => {
  it("satisfies adapter contract", async () => {
    const adapter = new MockAdapter(mockConfig());
    await assertAdapterContract(adapter);
  });

  it("executes scripted write actions", async () => {
    const sandbox = new FakeSandbox();
    const adapter = new MockAdapter(
      mockConfig({
        options: {
          script: [
            { type: "write", path: "out.txt", content: "hello" },
            { type: "respond", content: "done" },
          ],
        },
      }),
    );
    await adapter.initialize(createTestContext({ sandbox }));
    const res = await adapter.sendPrompt("go");
    expect(res.content).toBe("done");
    expect(await sandbox.readFile("out.txt")).toBe("hello");
    await adapter.shutdown();
  });
});

describe("registerBuiltinAdapters", () => {
  it("registers all adapter types", () => {
    const registry = new Registry();
    registerBuiltinAdapters(registry);
    const types = registry.listAdapterTypes();
    expect(types).toContain("mock");
    expect(types).toContain("cli");
    expect(types).toContain("http");
    expect(types).toContain("openai");
    expect(types).toContain("openrouter");
    expect(types).toContain("claude-code");
    expect(types).toContain("codex");
    expect(types).toContain("opencode");
  });

  it("creates mock adapter from config", () => {
    const registry = new Registry();
    registerBuiltinAdapters(registry);
    const adapter = registry.createAdapter({ name: "m", type: "mock" });
    expect(adapter.name).toBe("m");
  });
});
