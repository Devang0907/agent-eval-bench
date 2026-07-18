import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { AppContext } from "./context.js";
import { BenchmarkRunner } from "@agent-eval-bench/runner";
import { createTelemetry } from "@agent-eval-bench/telemetry";
import { writeAllReports } from "@agent-eval-bench/reporter";
import type { RunResult } from "@agent-eval-bench/core";

export async function executeRun(
  ctx: AppContext,
  opts?: {
    suites?: string[];
    agentName?: string;
    quiet?: boolean;
  },
): Promise<RunResult> {
  const outputDir = join(ctx.cwd, ctx.config.outputDir);
  await mkdir(outputDir, { recursive: true });

  const telemetry = createTelemetry(ctx.bus, {
    jsonlPath: join(outputDir, "events.jsonl"),
    sqlitePath: join(ctx.cwd, ctx.config.database),
  });

  const runner = new BenchmarkRunner({
    registry: ctx.registry,
    bus: ctx.bus,
    config: ctx.config,
  });

  try {
    const result = await runner.run({
      suites: opts?.suites,
      agentName: opts?.agentName,
    });

    telemetry.leaderboard?.saveRun(result);

    if (!opts?.quiet) {
      await writeAllReports(
        result,
        outputDir,
        ctx.config.reports,
        telemetry.collector.getEvents({}),
      );
    } else {
      await writeAllReports(
        result,
        outputDir,
        ctx.config.reports.filter((r) => r !== "terminal"),
        telemetry.collector.getEvents({}),
      );
    }

    return result;
  } finally {
    await telemetry.stop();
  }
}
