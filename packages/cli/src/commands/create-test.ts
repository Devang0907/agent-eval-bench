import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import chalk from "chalk";
import { BENCHMARK_CATEGORIES, DIFFICULTIES, slugify } from "@agent-eval-bench/core";

async function ask(rl: ReturnType<typeof createInterface>, q: string, def?: string): Promise<string> {
  const hint = def ? ` [${def}]` : "";
  const a = (await rl.question(`${q}${hint}: `)).trim();
  return a || def || "";
}

export async function createTestCommand(cwd = process.cwd()): Promise<void> {
  const rl = createInterface({ input, output });
  try {
    console.log(chalk.bold("\nCreate a new Agent Eval Bench test\n"));
    const name = await ask(rl, "Name", "My Benchmark");
    const category = await ask(rl, `Category (${BENCHMARK_CATEGORIES.join("|")})`, "filesystem");
    const difficulty = await ask(rl, `Difficulty (${DIFFICULTIES.join("|")})`, "medium");
    const description = await ask(rl, "Description", name);
    const prompt = await ask(rl, "Prompt", "Create a file called result.txt with ok");
    const filePath = await ask(rl, "Expected file path (optional)", "result.txt");

    const id = `${category}/${slugify(name)}`;
    const yaml = `id: ${id}
name: ${JSON.stringify(name)}
description: ${JSON.stringify(description)}
difficulty: ${difficulty}
category: ${category}
prompt: |
  ${prompt}
repository:
  files: {}
expected:
  files:
    - path: ${filePath}
      exists: true
validators:
  - name: file-exists
    params:
      path: ${filePath}
timeout: 120000
`;

    const dir = join(cwd, "benchmarks", category);
    await mkdir(dir, { recursive: true });
    const out = join(dir, `${slugify(name)}.yaml`);
    await writeFile(out, yaml, "utf-8");
    console.log(chalk.green(`\nCreated ${out}`));
    console.log(chalk.dim("Add this directory to config.benchmarks or move into packages/benchmarks."));
  } finally {
    rl.close();
  }
}
