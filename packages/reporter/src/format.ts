export function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60_000).toFixed(1)}m`;
}

export function formatUsd(n: number): string {
  return `$${n.toFixed(4)}`;
}

export function bar(score: number, width = 20): string {
  const filled = Math.round((Math.max(0, Math.min(100, score)) / 100) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

export function analyzeStrengthsWeaknesses(
  results: Array<{ category: string; scoreCard: { overall: number }; passed: boolean }>,
): { strengths: string[]; weaknesses: string[] } {
  const byCat = new Map<string, number[]>();
  for (const r of results) {
    const list = byCat.get(r.category) ?? [];
    list.push(r.scoreCard.overall);
    byCat.set(r.category, list);
  }
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  for (const [cat, scores] of byCat) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg >= 80) strengths.push(`${cat} (${avg.toFixed(0)})`);
    else if (avg < 50) weaknesses.push(`${cat} (${avg.toFixed(0)})`);
  }
  return { strengths, weaknesses };
}
