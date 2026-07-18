import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const root = import.meta.dirname;
const pkg = (name: string): string => resolve(root, "packages", name, "src", "index.ts");

export default defineConfig({
  resolve: {
    alias: {
      "@agent-eval-bench/core": pkg("core"),
      "@agent-eval-bench/sandbox": pkg("sandbox"),
      "@agent-eval-bench/adapters": pkg("adapters"),
      "@agent-eval-bench/telemetry": pkg("telemetry"),
      "@agent-eval-bench/scoring": pkg("scoring"),
      "@agent-eval-bench/runner": pkg("runner"),
      "@agent-eval-bench/reporter": pkg("reporter"),
      "@agent-eval-bench/benchmarks": pkg("benchmarks"),
    },
  },
  test: {
    include: ["packages/*/src/**/*.test.ts", "packages/*/test/**/*.test.ts"],
    environment: "node",
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
