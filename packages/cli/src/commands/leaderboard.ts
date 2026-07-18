import chalk from "chalk";
import { join } from "node:path";
import type { AppContext } from "../context.js";
import { openDatabase, LeaderboardRepository } from "@agent-eval-bench/telemetry";

export async function leaderboardCommand(
  ctx: AppContext,
  category?: string,
): Promise<void> {
  const db = openDatabase(join(ctx.cwd, ctx.config.database));
  const repo = new LeaderboardRepository(db);
  const ranks = repo.rankings({ category, limit: 25 });

  if (ranks.length === 0) {
    console.log(chalk.yellow("Leaderboard is empty. Run some benchmarks first."));
    return;
  }

  console.log(chalk.bold(`\nLeaderboard${category ? ` — ${category}` : ""}\n`));
  console.log(
    `${"#".padStart(3)}  ${"Agent".padEnd(24)} ${"Avg".padStart(8)} ${"Runs".padStart(6)}`,
  );
  console.log("─".repeat(48));
  ranks.forEach((r, i) => {
    console.log(
      `${String(i + 1).padStart(3)}  ${r.agentName.padEnd(24)} ${r.avgScore.toFixed(1).padStart(8)} ${String(r.runs).padStart(6)}`,
    );
  });
  console.log();
}
