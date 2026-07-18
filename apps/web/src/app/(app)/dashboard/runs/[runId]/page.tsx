"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch, type RunDetail, type TelemetryRow } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export default function RunDetailPage() {
  const params = useParams<{ runId: string }>();
  const runId = decodeURIComponent(params?.runId ?? "");
  const [run, setRun] = useState<RunDetail | null>(null);
  const [events, setEvents] = useState<TelemetryRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<{ run: RunDetail }>(`/v1/runs/${encodeURIComponent(runId)}`),
      apiFetch<{ events: TelemetryRow[] }>(
        `/v1/runs/${encodeURIComponent(runId)}/events?limit=200`,
      ),
    ])
      .then(([runRes, eventsRes]) => {
        setRun(runRes.run);
        setEvents(eventsRes.events);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, [runId]);

  if (error) {
    return (
      <p className="text-sm text-bad" role="alert" aria-live="polite">
        {error}
      </p>
    );
  }

  if (!run) {
    return <p className="text-mute">Loading run…</p>;
  }

  const dims = [
    "success",
    "accuracy",
    "planning",
    "efficiency",
    "verification",
    "recovery",
    "memory",
    "safety",
    "overall",
  ] as const;

  return (
    <div className="animate-rise space-y-8">
      <div>
        <Link href="/dashboard/runs" className="text-sm text-mute hover:text-snow">
          ← Runs
        </Link>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-snow">
          {run.agentName}
        </h1>
        <p className="mt-1 font-mono text-sm text-mute">{run.clientRunId}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <Badge variant={run.status === "completed" ? "good" : "default"}>{run.status}</Badge>
          <span className="text-mute">Overall</span>
          <span className="font-mono tabular text-snow">
            {(run.scoreCard.overall ?? 0).toFixed(1)}
          </span>
        </div>
      </div>

      <section className="rounded-3xl border border-line bg-panel/40 p-5 sm:p-6">
        <h2 className="font-display text-lg font-medium text-snow">Scorecard</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {dims.map((dim) => (
            <div key={dim} className="rounded-2xl border border-line bg-ink-soft/70 p-3">
              <p className="text-xs uppercase tracking-wider text-mute">{dim}</p>
              <p className="mt-1 font-mono text-xl tabular text-snow">
                {Number((run.scoreCard as Record<string, number>)[dim] ?? 0).toFixed(1)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-x-auto rounded-3xl border border-line bg-panel/40">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-medium text-snow">Benchmarks</h2>
        </div>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-mute">
            <tr className="border-b border-line">
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Result</th>
              <th className="px-5 py-3 font-medium">Score</th>
              <th className="px-5 py-3 font-medium">Duration</th>
            </tr>
          </thead>
          <tbody>
            {run.benchmarks.map((b) => (
              <tr key={b.id} className="border-b border-line/70 last:border-0">
                <td className="px-5 py-2.5 font-mono text-fog">{b.benchmarkId}</td>
                <td className="px-5 py-2.5 text-mute">{b.category}</td>
                <td className="px-5 py-2.5">
                  <Badge variant={b.skipped ? "warn" : b.passed ? "good" : "bad"}>
                    {b.skipped ? "skipped" : b.passed ? "passed" : "failed"}
                  </Badge>
                </td>
                <td className="px-5 py-2.5 font-mono tabular text-fog">
                  {(b.scoreCard.overall ?? 0).toFixed(1)}
                </td>
                <td className="px-5 py-2.5 tabular text-mute">{b.durationMs} ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-3xl border border-line bg-panel/40 p-5 sm:p-6">
        <h2 className="font-display text-lg font-medium text-snow">Telemetry log</h2>
        <p className="mt-1 text-sm text-mute">{events.length} events loaded</p>
        <ul className="mt-4 max-h-[480px] space-y-1 overflow-y-auto overscroll-contain border-t border-line pt-3 font-mono text-[12px]">
          {events.map((ev) => (
            <li key={ev.id} className="grid grid-cols-[48px_1fr] gap-3 py-1 text-mute">
              <span className="text-right tabular text-mute/70">{ev.seq}</span>
              <span className="min-w-0 break-words">
                <span className="text-accent-soft">{ev.type}</span>
                {ev.benchmarkId ? <span className="text-mute"> · {ev.benchmarkId}</span> : null}
                <span className="text-mute/60">
                  {" "}
                  ·{" "}
                  {new Intl.DateTimeFormat(undefined, { timeStyle: "medium" }).format(
                    new Date(ev.timestamp),
                  )}
                </span>
              </span>
            </li>
          ))}
          {events.length === 0 ? (
            <li className="text-sm text-mute">No telemetry events synced for this run.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
