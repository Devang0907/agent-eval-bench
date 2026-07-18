import { describe, it, expect } from "vitest";
import { DockerSandboxProvider } from "../src/docker.js";

const enabled = process.env["AGENT_EVAL_BENCH_DOCKER_TESTS"] === "1";

describe.skipIf(!enabled)("DockerSandbox", () => {
  it("creates and destroys a container", async () => {
    const provider = new DockerSandboxProvider();
    const available = await provider.isAvailable();
    expect(available).toBe(true);

    const sandbox = await provider.create({
      runId: "r1",
      benchmarkId: "b1",
      repository: { files: { "hi.txt": "hello" } },
      environment: { network: "none", memory: "512m", cpus: 1 },
    });

    try {
      expect(sandbox.info.provider).toBe("docker");
      expect(await sandbox.exists("hi.txt")).toBe(true);
      expect(await sandbox.readFile("hi.txt")).toBe("hello");
      const echo = await sandbox.exec("echo", ["ok"]);
      expect(echo.exitCode).toBe(0);
      expect(echo.stdout.trim()).toBe("ok");
    } finally {
      await sandbox.destroy();
    }
  }, 120_000);
});
