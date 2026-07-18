import { defineConfig } from "agent-eval-bench";

export default defineConfig({
  agents: [
    {
      name: "mock",
      type: "mock",
      options: {
        autoSucceed: true,
      },
    },
  ],
  suites: ["filesystem"],
  noDocker: true,
  concurrency: 1,
  reports: ["terminal", "json", "markdown"],
  outputDir: ".agent-eval-bench",
  database: ".agent-eval-bench/leaderboard.sqlite",
  plugins: [],
  benchmarks: [],
  failFast: false,
  verbose: false,
  retries: 0,
});
