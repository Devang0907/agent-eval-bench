import chalk from "chalk";
import { join } from "node:path";
import type { AppContext } from "../context.js";
import { openDatabase, LeaderboardRepository } from "@agent-eval-bench/telemetry";
import { writeAllReports } from "@agent-eval-bench/reporter";

export async function reportCommand(
  ctx: AppContext,
  runId: string | undefined,
  formats: string[],
): Promise<void> {
  const db = openDatabase(join(ctx.cwd, ctx.config.database));
  const repo = new LeaderboardRepository(db);

  let id = runId;
  if (!id) {
    const runs = repo.listRuns(1);
    id = runs[0]?.runId;
  }
  if (!id) {
    console.log(chalk.yellow("No runs found. Execute `agent-eval-bench run` first."));
    return;
  }

  const result = repo.getRun(id);
  if (!result) {
    console.log(chalk.red(`Run not found: ${id}`));
    return;
  }

  const outDir = join(ctx.cwd, ctx.config.outputDir);
  const written = await writeAllReports(result, outDir, formats);
  console.log(chalk.green(`Reports written:`));
  for (const p of written) console.log(`  ${p}`);
}
