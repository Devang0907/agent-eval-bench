import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadBenchmarksFromDir, type BenchmarkDefinition } from "@agent-eval-bench/core";

const here = dirname(fileURLToPath(import.meta.url));
export const BENCHMARKS_ROOT = join(here, "..", "definitions");

export async function loadOfficialBenchmarks(): Promise<BenchmarkDefinition[]> {
  return loadBenchmarksFromDir(BENCHMARKS_ROOT);
}

export function getBenchmarksRoot(): string {
  return BENCHMARKS_ROOT;
}
