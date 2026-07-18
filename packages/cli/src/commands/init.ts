import { writeFile, access } from "node:fs/promises";
import { join } from "node:path";
import chalk from "chalk";

const TEMPLATE = `import { defineConfig } from "agent-eval-bench";

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
`;

export async function initCommand(cwd = process.cwd()): Promise<void> {
  const path = join(cwd, "agent-eval-bench.config.ts");
  try {
    await access(path);
    console.log(chalk.yellow(`Config already exists: ${path}`));
    return;
  } catch {
    // create
  }
  await writeFile(path, TEMPLATE, "utf-8");
  console.log(chalk.green(`Created ${path}`));
  console.log(chalk.dim("Edit agents[] then run: agent-eval-bench run"));
}
