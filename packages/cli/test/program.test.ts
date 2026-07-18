import { describe, it, expect } from "bun:test";
import { createProgram } from "../src/program.js";
import { loadOfficialBenchmarks } from "@agent-eval-bench/benchmarks";

describe("CLI program", () => {
  it("registers expected commands", () => {
    const program = createProgram();
    const names = program.commands.map((c) => c.name());
    for (const cmd of [
      "init",
      "run",
      "benchmark",
      "list",
      "doctor",
      "compare",
      "report",
      "leaderboard",
      "create-test",
      "login",
      "logout",
      "whoami",
    ]) {
      expect(names).toContain(cmd);
    }
  });
});

describe("official benchmarks", () => {
  it("loads YAML suite", async () => {
    const benches = await loadOfficialBenchmarks();
    expect(benches.length).toBeGreaterThanOrEqual(40);
    const cats = new Set(benches.map((b) => b.category));
    expect(cats.has("context")).toBe(true);
    expect(cats.has("filesystem")).toBe(true);
    expect(cats.has("git")).toBe(true);
  });
});
