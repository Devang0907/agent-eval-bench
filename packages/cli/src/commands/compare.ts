import chalk from "chalk";
import { join } from "node:path";
import type { AppContext } from "../context.js";
import { openDatabase, LeaderboardRepository } from "@agent-eval-bench/telemetry";

export async function compareCommand(
  ctx: AppContext,
  agentA: string,
  agentB: string,
): Promise<void> {
  const db = openDatabase(join(ctx.cwd, ctx.config.database));
  const repo = new LeaderboardRepository(db);
  const rows = repo.compare(agentA, agentB);

  if (rows.length === 0) {
    console.log(chalk.yellow("No overlapping leaderboard entries for those agents."));
    console.log(chalk.dim("Run benchmarks for both agents first."));
    return;
  }

  console.log(chalk.bold(`\nCompare ${agentA} vs ${agentB}\n`));
  console.log(
    `${"Benchmark".padEnd(40)} ${agentA.slice(0, 12).padStart(12)} ${agentB.slice(0, 12).padStart(12)} ${"Δ".padStart(8)}`,
  );
  console.log("─".repeat(76));

  for (const row of rows) {
    const a = row.scoreA;
    const b = row.scoreB;
    const delta = a != null && b != null ? a - b : null;
    const deltaStr =
      delta == null
        ? "n/a"
        : delta > 0
          ? chalk.green(`+${delta.toFixed(1)}`)
          : delta < 0
            ? chalk.red(delta.toFixed(1))
            : "0.0";
    console.log(
      `${row.benchmarkId.padEnd(40)} ${String(a?.toFixed(1) ?? "-").padStart(12)} ${String(b?.toFixed(1) ?? "-").padStart(12)} ${deltaStr.padStart(8)}`,
    );
  }
  console.log();
}
