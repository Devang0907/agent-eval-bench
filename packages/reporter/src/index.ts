import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { Reporter, ReportData, RunResult, Registry } from "@agent-eval-bench/core";
import { analyzeStrengthsWeaknesses, bar, formatMs, formatUsd } from "./format.js";
import { buildTimeline, timelineMarkdown, runSummaryLines } from "./timeline.js";
import type { TelemetryEvent } from "@agent-eval-bench/core";

function toReportData(result: RunResult): ReportData {
  return {
    runId: result.runId,
    agentName: result.agentName,
    startedAt: result.startedAt,
    completedAt: result.completedAt,
    results: result.results.map((r) => ({
      benchmarkId: r.benchmarkId,
      name: r.name,
      category: r.category,
      difficulty: r.difficulty,
      passed: r.passed,
      scoreCard: r.scoreCard,
      durationMs: r.durationMs,
      error: r.error,
    })),
    scoreCard: result.scoreCard,
  };
}

export class MarkdownReporter implements Reporter {
  readonly name = "markdown";
  readonly formats = ["markdown"] as const;

  async report(data: ReportData, _format: string, outputPath: string): Promise<string> {
    const { strengths, weaknesses } = analyzeStrengthsWeaknesses(data.results);
    const lines: string[] = [
      `# Agent Eval Bench Report`,
      ``,
      `**Agent:** ${data.agentName}  `,
      `**Run:** \`${data.runId}\`  `,
      `**Overall:** ${data.scoreCard.overall.toFixed(1)} / 100  `,
      `**Duration:** ${formatMs(data.completedAt - data.startedAt)}`,
      ``,
      `## Score Card`,
      ``,
      `| Dimension | Score |`,
      `|---|---|`,
      ...Object.entries(data.scoreCard).map(
        ([k, v]) => `| ${k} | ${Number(v).toFixed(1)} ${bar(Number(v), 10)} |`,
      ),
      ``,
      `## Strengths`,
      strengths.length ? strengths.map((s) => `- ${s}`).join("\n") : "- _none_",
      ``,
      `## Weaknesses`,
      weaknesses.length ? weaknesses.map((s) => `- ${s}`).join("\n") : "- _none_",
      ``,
      `## Results`,
      ``,
      `| Benchmark | Category | Pass | Score | Duration |`,
      `|---|---|---|---|---|`,
      ...data.results.map(
        (r) =>
          `| ${r.benchmarkId} | ${r.category} | ${r.passed ? "✓" : "✗"} | ${r.scoreCard.overall.toFixed(1)} | ${formatMs(r.durationMs)} |`,
      ),
      ``,
    ];
    const md = lines.join("\n");
    await mkdir(dirname(outputPath), { recursive: true });
    await Bun.write(outputPath, md);
    return outputPath;
  }
}

export class JsonReporter implements Reporter {
  readonly name = "json";
  readonly formats = ["json"] as const;

  async report(data: ReportData, _format: string, outputPath: string): Promise<string> {
    await mkdir(dirname(outputPath), { recursive: true });
    await Bun.write(outputPath, JSON.stringify(data, null, 2));
    return outputPath;
  }
}

export class HtmlReporter implements Reporter {
  readonly name = "html";
  readonly formats = ["html"] as const;

  async report(data: ReportData, _format: string, outputPath: string): Promise<string> {
    const { strengths, weaknesses } = analyzeStrengthsWeaknesses(data.results);
    const bars = Object.entries(data.scoreCard)
      .map(([k, v]) => {
        const pct = Number(v);
        return `<div class="row"><span>${k}</span><div class="bar"><i style="width:${pct}%"></i></div><b>${pct.toFixed(1)}</b></div>`;
      })
      .join("\n");

    const rows = data.results
      .map(
        (r) =>
          `<tr><td>${r.benchmarkId}</td><td>${r.category}</td><td class="${r.passed ? "pass" : "fail"}">${r.passed ? "PASS" : "FAIL"}</td><td>${r.scoreCard.overall.toFixed(1)}</td><td>${formatMs(r.durationMs)}</td></tr>`,
      )
      .join("\n");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>Agent Eval Bench — ${data.agentName}</title>
<style>
  :root { --bg:#0f1419; --fg:#e7ecf3; --muted:#8b9bb4; --accent:#3d9cf0; --pass:#3ecf8e; --fail:#f07178; }
  body { font-family: "Segoe UI", system-ui, sans-serif; background:var(--bg); color:var(--fg); margin:0; padding:2rem; }
  h1 { font-weight:600; letter-spacing:-0.02em; }
  .meta { color:var(--muted); margin-bottom:2rem; }
  .card { background:#1a2332; border-radius:12px; padding:1.25rem 1.5rem; margin-bottom:1.5rem; }
  .row { display:grid; grid-template-columns:120px 1fr 48px; gap:0.75rem; align-items:center; margin:0.35rem 0; }
  .bar { background:#243044; border-radius:999px; height:10px; overflow:hidden; }
  .bar i { display:block; height:100%; background:linear-gradient(90deg,var(--accent),#7c5cff); }
  table { width:100%; border-collapse:collapse; }
  th,td { text-align:left; padding:0.6rem 0.75rem; border-bottom:1px solid #243044; }
  .pass { color:var(--pass); font-weight:600; }
  .fail { color:var(--fail); font-weight:600; }
  ul { margin:0.5rem 0 0; padding-left:1.2rem; color:var(--muted); }
</style>
</head>
<body>
  <h1>Agent Eval Bench</h1>
  <p class="meta">${data.agentName} · ${data.runId} · overall <strong>${data.scoreCard.overall.toFixed(1)}</strong></p>
  <div class="card"><h2>Score Card</h2>${bars}</div>
  <div class="card"><h2>Strengths</h2><ul>${strengths.map((s) => `<li>${s}</li>`).join("") || "<li>none</li>"}</ul></div>
  <div class="card"><h2>Weaknesses</h2><ul>${weaknesses.map((s) => `<li>${s}</li>`).join("") || "<li>none</li>"}</ul></div>
  <div class="card"><h2>Results</h2>
  <table><thead><tr><th>Benchmark</th><th>Category</th><th>Status</th><th>Score</th><th>Duration</th></tr></thead>
  <tbody>${rows}</tbody></table></div>
</body>
</html>`;
    await mkdir(dirname(outputPath), { recursive: true });
    await Bun.write(outputPath, html);
    return outputPath;
  }
}

export class TerminalReporter implements Reporter {
  readonly name = "terminal";
  readonly formats = ["terminal"] as const;

  async report(data: ReportData): Promise<string> {
    // chalk imported dynamically to keep SSR-safe
    const chalk = (await import("chalk")).default;
    const lines = [
      chalk.bold.cyan("\n═══ Agent Eval Bench Report ═══"),
      ...runSummaryLines({
        runId: data.runId,
        agentName: data.agentName,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
        results: data.results.map((r) => ({
          ...r,
          agentName: data.agentName,
          metrics: {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
            costUsd: 0,
            latencyMs: 0,
            toolCalls: 0,
            shellCommands: 0,
            fileEdits: 0,
            gitOps: 0,
            retries: 0,
            loopCount: 0,
            interrupts: 0,
            contextSize: 0,
          },
          difficulty: r.difficulty as "easy",
          skipped: false,
          validatorResults: [],
        })),
        scoreCard: data.scoreCard,
        metrics: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          costUsd: 0,
          latencyMs: 0,
          toolCalls: 0,
          shellCommands: 0,
          fileEdits: 0,
          gitOps: 0,
          retries: 0,
          loopCount: 0,
          interrupts: 0,
          contextSize: 0,
        },
        status: "completed",
      }),
      "",
      chalk.bold("Score Card"),
      ...Object.entries(data.scoreCard).map(
        ([k, v]) => `  ${k.padEnd(14)} ${bar(Number(v))} ${Number(v).toFixed(1)}`,
      ),
      "",
      chalk.bold("Results"),
      ...data.results.map(
        (r) =>
          `  ${r.passed ? chalk.green("✓") : chalk.red("✗")} ${r.benchmarkId.padEnd(36)} ${r.scoreCard.overall.toFixed(1).padStart(5)}  ${formatMs(r.durationMs)}`,
      ),
      "",
    ];
    const out = lines.join("\n");
    console.log(out);
    return out;
  }
}

export async function writeAllReports(
  result: RunResult,
  outputDir: string,
  formats: string[],
  events?: readonly TelemetryEvent[],
): Promise<string[]> {
  const data = toReportData(result);
  const reporters: Reporter[] = [
    new MarkdownReporter(),
    new JsonReporter(),
    new HtmlReporter(),
    new TerminalReporter(),
  ];
  const written: string[] = [];

  for (const format of formats) {
    const reporter = reporters.find((r) => r.formats.includes(format as "markdown"));
    if (!reporter) continue;
    if (format === "terminal") {
      await reporter.report(data, format, "");
      continue;
    }
    const ext = format === "markdown" ? "md" : format;
    const path = join(outputDir, `report-${result.runId}.${ext}`);
    written.push(await reporter.report(data, format, path));
  }

  if (events?.length) {
    const tl = join(outputDir, `timeline-${result.runId}.md`);
    await Bun.write(tl, `# Timeline\n\n${timelineMarkdown(buildTimeline(events))}`);
    written.push(tl);
  }

  return written;
}

export function registerBuiltinReporters(registry: Registry): void {
  registry.registerReporter(new MarkdownReporter());
  registry.registerReporter(new JsonReporter());
  registry.registerReporter(new HtmlReporter());
  registry.registerReporter(new TerminalReporter());
}

export { toReportData, analyzeStrengthsWeaknesses, buildTimeline };
