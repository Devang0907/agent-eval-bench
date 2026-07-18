import { defineConfig } from "agent-eval-bench";

export default defineConfig({
  agents: [
    {
      name: "mock",
      type: "mock",
    },
    // {
    //   name: "claude",
    //   type: "claude-code",
    //   command: "claude",
    // },
    // {
    //   name: "codex",
    //   type: "codex",
    //   command: "codex",
    // },
  ],
  suites: [],
  noDocker: true,
  concurrency: 1,
  reports: ["terminal", "json", "markdown", "html"],
  outputDir: ".agent-eval-bench",
  database: ".agent-eval-bench/leaderboard.sqlite",
  plugins: [],
  benchmarks: [],
  failFast: false,
  verbose: false,
  retries: 0,
});
