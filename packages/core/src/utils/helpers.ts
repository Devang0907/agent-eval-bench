/** Generate a UUID v4 */
export function uniqueId(): string {
  return crypto.randomUUID();
}

/** Short id for labels / container names */
export function shortId(len = 8): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, len);
}

/** Extract a readable error message */
export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

/** Derive suite/category prefix from a benchmark id like "context/basic" */
export function suiteOf(id: string): string {
  const idx = id.indexOf("/");
  return idx === -1 ? id : id.slice(0, idx);
}

/** Slugify a string for filenames */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Normalize prompt into ordered steps */
export function promptSteps(
  prompt: string | Array<{ role: string; content: string; delayMs?: number }>,
): Array<{ role: "user" | "system"; content: string; delayMs?: number }> {
  if (typeof prompt === "string") {
    return [{ role: "user", content: prompt }];
  }
  return prompt.map((p) => {
    const step: { role: "user" | "system"; content: string; delayMs?: number } = {
      role: p.role === "system" ? "system" : "user",
      content: p.content,
    };
    if (p.delayMs !== undefined) step.delayMs = p.delayMs;
    return step;
  });
}

export const BENCHMARK_CATEGORIES = [
  "context",
  "memory",
  "planning",
  "loop",
  "recovery",
  "git",
  "shell",
  "filesystem",
  "verification",
  "hallucination",
  "ambiguity",
  "long-horizon",
  "tool-usage",
  "efficiency",
] as const;

export const DIFFICULTIES = ["easy", "medium", "hard", "expert"] as const;
