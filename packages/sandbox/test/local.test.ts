import { describe, it, expect, afterEach } from "vitest";
import { LocalSandboxProvider } from "../src/local.js";
import type { SandboxHandle } from "@agent-eval-bench/core";

describe("LocalSandbox", () => {
  const provider = new LocalSandboxProvider();
  let sandbox: SandboxHandle | null = null;

  afterEach(async () => {
    if (sandbox) {
      await sandbox.destroy();
      sandbox = null;
    }
  });

  it("creates a fresh workdir with git", async () => {
    sandbox = await provider.create({
      runId: "r1",
      benchmarkId: "b1",
      repository: { files: { "hello.txt": "world" } },
    });
    expect(sandbox.info.provider).toBe("local");
    expect(await sandbox.exists("hello.txt")).toBe(true);
    expect(await sandbox.readFile("hello.txt")).toBe("world");
    const git = await sandbox.exec("git", ["rev-parse", "--is-inside-work-tree"]);
    expect(git.exitCode).toBe(0);
  });

  it("writes, reads, and lists files", async () => {
    sandbox = await provider.create({ runId: "r1", benchmarkId: "b1" });
    await sandbox.writeFile("src/a.ts", "export const a = 1;\n");
    expect(await sandbox.readFile("src/a.ts")).toContain("a = 1");
    const files = await sandbox.listFiles("src/**");
    expect(files.some((f) => f.includes("a.ts"))).toBe(true);
  });

  it("executes commands and returns exit codes", async () => {
    sandbox = await provider.create({ runId: "r1", benchmarkId: "b1" });
    const ok = await sandbox.exec("node", ["-e", "process.stdout.write('hi')"]);
    expect(ok.exitCode).toBe(0);
    expect(ok.stdout.trim()).toBe("hi");

    const fail = await sandbox.exec("node", ["-e", "process.exit(7)"]);
    expect(fail.exitCode).toBe(7);
  });

  it("blocks path escape", async () => {
    sandbox = await provider.create({ runId: "r1", benchmarkId: "b1" });
    await expect(sandbox.writeFile("../outside.txt", "nope")).rejects.toThrow();
  });

  it("seeds node-basic fixture", async () => {
    sandbox = await provider.create({
      runId: "r1",
      benchmarkId: "b1",
      repository: { fixture: "node-basic" },
    });
    expect(await sandbox.exists("package.json")).toBe(true);
    expect(await sandbox.exists("src/index.js")).toBe(true);
  });
});
