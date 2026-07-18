import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import chalk from "chalk";
import type { AppContext } from "./context.js";
import { BenchmarkRunner } from "@agent-eval-bench/runner";
import { createTelemetry } from "@agent-eval-bench/telemetry";
import { writeAllReports } from "@agent-eval-bench/reporter";
import type { RunResult } from "@agent-eval-bench/core";
import { loadCredentials } from "./cloud/credentials.js";
import { syncRun } from "./cloud/client.js";

export async function executeRun(
  ctx: AppContext,
  opts?: {
    suites?: string[];
    agentName?: string;
    quiet?: boolean;
    sync?: boolean;
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

    const events = telemetry.collector.getEvents({});

    if (!opts?.quiet) {
      await writeAllReports(result, outputDir, ctx.config.reports, events);
    } else {
      await writeAllReports(
        result,
        outputDir,
        ctx.config.reports.filter((r) => r !== "terminal"),
        events,
      );
    }

    const creds = await loadCredentials();
    const shouldSync = Boolean(opts?.sync || creds);
    if (shouldSync) {
      if (!creds) {
        if (!opts?.quiet) {
          console.warn(chalk.yellow("Cloud sync skipped — not logged in. Run: agent-eval-bench login"));
        }
      } else {
        const synced = await syncRun(result, events);
        if (!opts?.quiet) {
          if (synced.ok) {
            console.log(chalk.green("Synced run to cloud dashboard."));
          } else {
            console.warn(
              chalk.yellow(
                `Cloud sync failed (${synced.reason}). Local reports were still written.`,
              ),
            );
          }
        }
      }
    }

    return result;
  } finally {
    await telemetry.stop();
  }
}
