import type { BenchmarkRunResult, ScoreCard } from "@agent-eval-bench/core";
import { createEmptyScoreCard, SCORE_DIMENSIONS } from "@agent-eval-bench/core";

export function summarizeResults(results: BenchmarkRunResult[]): {
  passed: number;
  failed: number;
  skipped: number;
  scoreCard: ScoreCard;
  strengths: string[];
  weaknesses: string[];
} {
  const scored = results.filter((r) => !r.skipped);
  const passed = scored.filter((r) => r.passed).length;
  const failed = scored.length - passed;
  const skipped = results.length - scored.length;

  const scoreCard = createEmptyScoreCard();
  if (scored.length > 0) {
    for (const dim of [...SCORE_DIMENSIONS, "overall"] as const) {
      const sum = scored.reduce((acc, r) => acc + r.scoreCard[dim], 0);
      scoreCard[dim] = Math.round((sum / scored.length) * 100) / 100;
    }
  }

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  for (const dim of SCORE_DIMENSIONS) {
    const v = scoreCard[dim];
    if (v >= 80) strengths.push(dim);
    else if (v < 50) weaknesses.push(dim);
  }

  return { passed, failed, skipped, scoreCard, strengths, weaknesses };
}
