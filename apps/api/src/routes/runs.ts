import { RunResultSchema, TelemetryEventSchema } from "@agent-eval-bench/core";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import type { Auth } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";
import { error, json, resolveAuth } from "../middleware/auth.js";

const EventsBatchSchema = z.object({
  events: z.array(TelemetryEventSchema).min(1).max(1000),
});

export async function handleRunsRoutes(
  request: Request,
  url: URL,
  auth: Auth,
): Promise<Response | null> {
  if (url.pathname === "/v1/runs" && request.method === "POST") {
    const ctx = await resolveAuth(request, auth);
    if (!ctx) return error(401, "Unauthorized");

    const parsed = RunResultSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return error(400, "Invalid RunResult", { details: parsed.error.flatten() });
    }

    const result = parsed.data;
    const run = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const upserted = await tx.run.upsert({
        where: {
          userId_clientRunId: {
            userId: ctx.user.id,
            clientRunId: result.runId,
          },
        },
        create: {
          userId: ctx.user.id,
          clientRunId: result.runId,
          agentName: result.agentName,
          agentVersion: result.agentVersion ?? null,
          status: result.status,
          scoreCard: result.scoreCard,
          metrics: result.metrics,
          startedAt: new Date(result.startedAt),
          completedAt: new Date(result.completedAt),
          raw: result,
        },
        update: {
          agentName: result.agentName,
          agentVersion: result.agentVersion ?? null,
          status: result.status,
          scoreCard: result.scoreCard,
          metrics: result.metrics,
          startedAt: new Date(result.startedAt),
          completedAt: new Date(result.completedAt),
          raw: result,
        },
      });

      await tx.benchmarkResult.deleteMany({ where: { runId: upserted.id } });
      if (result.results.length > 0) {
        await tx.benchmarkResult.createMany({
          data: result.results.map((r) => ({
            runId: upserted.id,
            benchmarkId: r.benchmarkId,
            name: r.name,
            category: r.category,
            difficulty: r.difficulty,
            agentName: r.agentName,
            passed: r.passed,
            skipped: r.skipped,
            skipReason: r.skipReason ?? null,
            scoreCard: r.scoreCard,
            metrics: r.metrics,
            durationMs: r.durationMs,
            error: r.error ?? null,
            validatorResults: r.validatorResults,
          })),
        });
      }

      return upserted;
    });

    return json({
      id: run.id,
      clientRunId: run.clientRunId,
      syncedAt: run.updatedAt,
    });
  }

  if (url.pathname === "/v1/runs" && request.method === "GET") {
    const ctx = await resolveAuth(request, auth);
    if (!ctx) return error(401, "Unauthorized");

    const agent = url.searchParams.get("agent") ?? undefined;
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "50"), 100);
    const cursor = url.searchParams.get("cursor") ?? undefined;

    const runs = await prisma.run.findMany({
      where: {
        userId: ctx.user.id,
        ...(agent ? { agentName: agent } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: {
        id: true,
        clientRunId: true,
        agentName: true,
        agentVersion: true,
        status: true,
        scoreCard: true,
        metrics: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
        _count: { select: { benchmarks: true, events: true } },
      },
    });

    return json({
      runs,
      nextCursor: runs.length === limit ? runs[runs.length - 1]?.id : null,
    });
  }

  const eventsPostMatch = url.pathname.match(/^\/v1\/runs\/([^/]+)\/events$/);
  if (eventsPostMatch && request.method === "POST") {
    const ctx = await resolveAuth(request, auth);
    if (!ctx) return error(401, "Unauthorized");

    const clientRunId = decodeURIComponent(eventsPostMatch[1]!);
    const run = await prisma.run.findUnique({
      where: {
        userId_clientRunId: { userId: ctx.user.id, clientRunId },
      },
    });
    if (!run) return error(404, "Run not found — sync the run first");

    const body = EventsBatchSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return error(400, "Invalid events batch");

    let seqBase = await prisma.telemetryEvent.count({ where: { runId: run.id } });
    const rows = body.data.events.map((event, i) => ({
      runId: run.id,
      clientEventId: event.id,
      seq: seqBase + i + 1,
      type: event.type,
      timestamp: new Date(event.timestamp),
      benchmarkId: event.benchmarkId ?? null,
      agentName: event.agentName ?? null,
      payload: {
        data: event.data,
        durationMs: event.durationMs,
      },
      durationMs: event.durationMs ?? null,
    }));

    // ignore duplicates on re-upload
    let inserted = 0;
    for (const row of rows) {
      try {
        await prisma.telemetryEvent.create({ data: row });
        inserted += 1;
      } catch {
        // unique violation — skip
      }
      seqBase += 1;
    }

    return json({ inserted, total: rows.length });
  }

  const runDetailMatch = url.pathname.match(/^\/v1\/runs\/([^/]+)$/);
  if (runDetailMatch && request.method === "GET") {
    const ctx = await resolveAuth(request, auth);
    if (!ctx) return error(401, "Unauthorized");

    const key = decodeURIComponent(runDetailMatch[1]!);
    const run = await prisma.run.findFirst({
      where: {
        userId: ctx.user.id,
        OR: [{ id: key }, { clientRunId: key }],
      },
      include: {
        benchmarks: { orderBy: { benchmarkId: "asc" } },
        _count: { select: { events: true } },
      },
    });
    if (!run) return error(404, "Run not found");
    return json({ run });
  }

  const eventsGetMatch = url.pathname.match(/^\/v1\/runs\/([^/]+)\/events$/);
  if (eventsGetMatch && request.method === "GET") {
    const ctx = await resolveAuth(request, auth);
    if (!ctx) return error(401, "Unauthorized");

    const key = decodeURIComponent(eventsGetMatch[1]!);
    const run = await prisma.run.findFirst({
      where: {
        userId: ctx.user.id,
        OR: [{ id: key }, { clientRunId: key }],
      },
    });
    if (!run) return error(404, "Run not found");

    const limit = Math.min(Number(url.searchParams.get("limit") ?? "100"), 500);
    const offset = Math.max(Number(url.searchParams.get("offset") ?? "0"), 0);
    const type = url.searchParams.get("type") ?? undefined;

    const events = await prisma.telemetryEvent.findMany({
      where: {
        runId: run.id,
        ...(type ? { type } : {}),
      },
      orderBy: { seq: "asc" },
      take: limit,
      skip: offset,
    });

    const total = await prisma.telemetryEvent.count({
      where: { runId: run.id, ...(type ? { type } : {}) },
    });

    return json({ events, total, limit, offset });
  }

  if (url.pathname === "/v1/leaderboard" && request.method === "GET") {
    const ctx = await resolveAuth(request, auth);
    if (!ctx) return error(401, "Unauthorized");

    const runs = await prisma.run.findMany({
      where: { userId: ctx.user.id, status: "completed" },
      orderBy: { completedAt: "desc" },
      take: 200,
      select: {
        agentName: true,
        scoreCard: true,
        metrics: true,
        completedAt: true,
        clientRunId: true,
      },
    });

    type Agg = {
      agentName: string;
      runs: number;
      avgOverall: number;
      bestOverall: number;
      lastRunAt: string;
    };

    const byAgent = new Map<string, { sums: number; best: number; runs: number; last: Date }>();
    for (const run of runs) {
      const score = run.scoreCard as { overall?: number };
      const overall = typeof score.overall === "number" ? score.overall : 0;
      const cur = byAgent.get(run.agentName) ?? {
        sums: 0,
        best: 0,
        runs: 0,
        last: run.completedAt,
      };
      cur.sums += overall;
      cur.best = Math.max(cur.best, overall);
      cur.runs += 1;
      if (run.completedAt > cur.last) cur.last = run.completedAt;
      byAgent.set(run.agentName, cur);
    }

    const leaderboard: Agg[] = [...byAgent.entries()]
      .map(([agentName, v]) => ({
        agentName,
        runs: v.runs,
        avgOverall: Math.round((v.sums / v.runs) * 10) / 10,
        bestOverall: Math.round(v.best * 10) / 10,
        lastRunAt: v.last.toISOString(),
      }))
      .sort((a, b) => b.avgOverall - a.avgOverall);

    return json({ leaderboard });
  }

  return null;
}
