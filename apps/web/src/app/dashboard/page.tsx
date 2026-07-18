"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, type RunListItem } from "@/lib/api";

export default function DashboardOverviewPage() {
  const [runs, setRuns] = useState<RunListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ runs: RunListItem[] }>("/v1/runs?limit=20")
      .then((data) => setRuns(data.runs))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  const completed = runs.filter((r) => r.status === "completed");
  const avg =
    completed.length === 0
      ? 0
      : completed.reduce((sum, r) => sum + (r.scoreCard.overall ?? 0), 0) / completed.length;

  return (
    <div className="animate-rise">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-snow">Overview</h1>
      <p className="mt-2 text-sm text-mute">
        Recent synced evaluation runs from your linked CLI machines.
      </p>

      {error && <p className="mt-6 text-sm text-bad">{error}</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Synced runs", value: String(runs.length) },
          { label: "Avg overall", value: avg.toFixed(1) },
          {
            label: "Events",
            value: String(runs.reduce((n, r) => n + r._count.events, 0)),
          },
        ].map((stat) => (
          <div key={stat.label} className="border-t border-line pt-4">
            <p className="text-xs uppercase tracking-wider text-mute">{stat.label}</p>
            <p className="mt-1 font-display text-3xl font-semibold text-snow">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-snow">Latest runs</h2>
          <Link href="/dashboard/runs" className="text-sm text-accent-soft hover:text-snow">
            View all
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-line border-t border-line">
          {runs.slice(0, 8).map((run) => (
            <li key={run.id}>
              <Link
                href={`/dashboard/runs/${run.clientRunId}`}
                className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm hover:bg-panel/40"
              >
                <span className="text-snow">{run.agentName}</span>
                <span className="text-mute">{run.clientRunId.slice(0, 12)}…</span>
                <span className="font-mono text-fog">{(run.scoreCard.overall ?? 0).toFixed(1)}</span>
              </Link>
            </li>
          ))}
          {runs.length === 0 && !error && (
            <li className="py-8 text-sm text-mute">
              No synced runs yet. Run{" "}
              <code className="text-fog">agent-eval-bench login</code> then{" "}
              <code className="text-fog">agent-eval-bench run</code>.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
