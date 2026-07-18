import { Command } from "commander";
import chalk from "chalk";
import { createAppContext } from "./context.js";
import { executeRun } from "./execute-run.js";
import { initCommand } from "./commands/init.js";
import { listCommand } from "./commands/list.js";
import { doctorCommand } from "./commands/doctor.js";
import { compareCommand } from "./commands/compare.js";
import { reportCommand } from "./commands/report.js";
import { leaderboardCommand } from "./commands/leaderboard.js";
import { createTestCommand } from "./commands/create-test.js";
import { loginCommand } from "./commands/login.js";
import { logoutCommand } from "./commands/logout.js";
import { whoamiCommand } from "./commands/whoami.js";
import { errorMessage } from "@agent-eval-bench/core";

export function createProgram(): Command {
  const program = new Command();

  program
    .name("agent-eval-bench")
    .description("Evaluation framework for autonomous AI coding agents")
    .version("0.1.0");

  program
    .command("init")
    .description("Create agent-eval-bench.config.ts")
    .action(async () => {
      await initCommand();
    });

  program
    .command("run [suite]")
    .description("Run benchmarks (optionally filter by suite/category)")
    .option("-a, --agent <name>", "Agent name from config")
    .option("--no-docker", "Force local sandbox")
    .option("-c, --concurrency <n>", "Concurrent benchmarks", "1")
    .option("--sync", "Upload results to the cloud dashboard when logged in")
    .action(
      async (
        suite: string | undefined,
        opts: { agent?: string; docker?: boolean; concurrency?: string; sync?: boolean },
      ) => {
        const ctx = await createAppContext();
        if (opts.docker === false) ctx.config.noDocker = true;
        if (opts.concurrency) ctx.config.concurrency = Number(opts.concurrency);
        const suites = suite ? [suite] : undefined;
        const result = await executeRun(ctx, {
          suites,
          agentName: opts.agent,
          sync: opts.sync,
        });
        const failed = result.results.filter((r) => !r.passed && !r.skipped).length;
        process.exitCode = failed > 0 ? 1 : 0;
      },
    );

  program
    .command("benchmark")
    .description("Run the official Agent Eval Bench suite")
    .option("-a, --agent <name>", "Agent name from config")
    .option("--sync", "Upload results to the cloud dashboard when logged in")
    .action(async (opts: { agent?: string; sync?: boolean }) => {
      const ctx = await createAppContext();
      ctx.config.noDocker = ctx.config.noDocker;
      const result = await executeRun(ctx, { agentName: opts.agent, sync: opts.sync });
      process.exitCode = result.results.some((r) => !r.passed && !r.skipped) ? 1 : 0;
    });

  program
    .command("list")
    .description("List available benchmarks")
    .option("-c, --category <name>", "Filter by category")
    .action(async (opts: { category?: string }) => {
      const ctx = await createAppContext();
      await listCommand(ctx, opts.category);
    });

  program
    .command("doctor")
    .description("Check Docker, Git, Bun, adapters, and permissions")
    .action(async () => {
      await doctorCommand();
    });

  program
    .command("compare <agentA> <agentB>")
    .description("Compare two agents from the local leaderboard")
    .action(async (agentA: string, agentB: string) => {
      const ctx = await createAppContext();
      await compareCommand(ctx, agentA, agentB);
    });

  program
    .command("report [runId]")
    .description("Generate reports for the latest (or specified) run")
    .option("-f, --format <formats>", "Comma-separated: markdown,html,json,terminal", "markdown,html,json,terminal")
    .action(async (runId: string | undefined, opts: { format: string }) => {
      const ctx = await createAppContext();
      await reportCommand(ctx, runId, opts.format.split(","));
    });

  program
    .command("leaderboard")
    .description("Show local leaderboard rankings")
    .option("-c, --category <name>", "Filter by category")
    .action(async (opts: { category?: string }) => {
      const ctx = await createAppContext();
      await leaderboardCommand(ctx, opts.category);
    });

  program
    .command("create-test")
    .description("Interactive wizard to create a new benchmark")
    .action(async () => {
      await createTestCommand();
    });

  program
    .command("login")
    .description("Link this machine to the Agent Eval Bench cloud dashboard")
    .action(async () => {
      await loginCommand();
    });

  program
    .command("logout")
    .description("Revoke cloud credentials on this machine")
    .action(async () => {
      await logoutCommand();
    });

  program
    .command("whoami")
    .description("Show the cloud account linked to this machine")
    .action(async () => {
      await whoamiCommand();
    });

  program.configureOutput({
    outputError: (str) => process.stderr.write(chalk.red(str)),
  });

  program.hook("preAction", async () => {
    // reserved for global flags
  });

  return program;
}

export async function runCli(argv = process.argv): Promise<void> {
  const program = createProgram();
  try {
    await program.parseAsync(argv);
  } catch (err) {
    console.error(chalk.red(errorMessage(err)));
    process.exitCode = 1;
  }
}
