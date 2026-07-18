"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch, type RunDetail, type TelemetryRow } from "@/lib/api";

export default function RunDetailPage() {
  const params = useParams<{ runId: string }>();
  const runId = decodeURIComponent(params.runId);
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
    return <p className="text-sm text-bad">{error}</p>;
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
    <div className="animate-rise space-y-10">
      <div>
        <Link href="/dashboard/runs" className="text-sm text-mute hover:text-snow">
          ← Runs
        </Link>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-snow">
          {run.agentName}
        </h1>
        <p className="mt-1 font-mono text-sm text-mute">{run.clientRunId}</p>
        <p className="mt-2 text-sm text-fog">
          Status <span className="text-snow">{run.status}</span> · Overall{" "}
          <span className="font-mono text-snow">{(run.scoreCard.overall ?? 0).toFixed(1)}</span>
        </p>
      </div>

      <section>
        <h2 className="font-display text-lg font-medium text-snow">Scorecard</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {dims.map((dim) => (
            <div key={dim} className="border-t border-line pt-3">
              <p className="text-xs uppercase tracking-wider text-mute">{dim}</p>
              <p className="mt-1 font-mono text-xl text-snow">
                {Number((run.scoreCard as Record<string, number>)[dim] ?? 0).toFixed(1)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-medium text-snow">Benchmarks</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-mute">
              <tr className="border-b border-line">
                <th className="py-2 font-medium">ID</th>
                <th className="py-2 font-medium">Category</th>
                <th className="py-2 font-medium">Result</th>
                <th className="py-2 font-medium">Score</th>
                <th className="py-2 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              {run.benchmarks.map((b) => (
                <tr key={b.id} className="border-b border-line/70">
                  <td className="py-2 font-mono text-fog">{b.benchmarkId}</td>
                  <td className="py-2 text-mute">{b.category}</td>
                  <td className={`py-2 ${b.skipped ? "text-warn" : b.passed ? "text-good" : "text-bad"}`}>
                    {b.skipped ? "skipped" : b.passed ? "passed" : "failed"}
                  </td>
                  <td className="py-2 font-mono text-fog">
                    {(b.scoreCard.overall ?? 0).toFixed(1)}
                  </td>
                  <td className="py-2 text-mute">{b.durationMs}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-medium text-snow">Telemetry log</h2>
        <p className="mt-1 text-sm text-mute">{events.length} events loaded</p>
        <ul className="mt-4 max-h-[480px] space-y-1 overflow-y-auto border-t border-line pt-3 font-mono text-[12px]">
          {events.map((ev) => (
            <li key={ev.id} className="grid grid-cols-[48px_1fr] gap-3 py-1 text-mute">
              <span className="text-right text-mute/70">{ev.seq}</span>
              <span>
                <span className="text-accent-soft">{ev.type}</span>
                {ev.benchmarkId ? (
                  <span className="text-mute"> · {ev.benchmarkId}</span>
                ) : null}
                <span className="text-mute/60"> · {new Date(ev.timestamp).toLocaleTimeString()}</span>
              </span>
            </li>
          ))}
          {events.length === 0 && (
            <li className="text-sm text-mute">No telemetry events synced for this run.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
