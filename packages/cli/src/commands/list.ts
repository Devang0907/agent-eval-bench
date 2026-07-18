import chalk from "chalk";
import type { AppContext } from "../context.js";

export async function listCommand(ctx: AppContext, category?: string): Promise<void> {
  const benches = ctx.registry.listBenchmarks(category ? { category } : undefined);
  if (benches.length === 0) {
    console.log(chalk.yellow("No benchmarks found."));
    return;
  }

  console.log(chalk.bold(`\n${benches.length} benchmarks\n`));
  const byCat = new Map<string, typeof benches>();
  for (const b of benches) {
    const list = byCat.get(b.category) ?? [];
    list.push(b);
    byCat.set(b.category, list);
  }

  for (const [cat, list] of [...byCat.entries()].sort()) {
    console.log(chalk.cyan.bold(cat));
    for (const b of list) {
      console.log(
        `  ${chalk.dim(b.difficulty.padEnd(7))} ${b.id.padEnd(40)} ${b.name}`,
      );
    }
    console.log();
  }
}
