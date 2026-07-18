"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, type RunListItem } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function statusVariant(status: string) {
  if (status === "completed") return "good" as const;
  if (status === "failed") return "bad" as const;
  if (status === "running") return "warn" as const;
  return "default" as const;
}

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
    <div className="animate-rise space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-snow">Overview</h1>
          <p className="mt-2 text-sm text-mute">
            Recent synced evaluation runs from your linked CLI machines.
          </p>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href="/dashboard/runs">View all runs</Link>
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-bad" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Synced runs", value: String(runs.length) },
          { label: "Avg overall", value: avg.toFixed(1) },
          {
            label: "Events",
            value: String(runs.reduce((n, r) => n + r._count.events, 0)),
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-line bg-panel/50 p-5">
            <p className="text-xs uppercase tracking-wider text-mute">{stat.label}</p>
            <p className="mt-2 font-display text-3xl font-semibold tabular text-snow">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-3xl border border-line bg-panel/40">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-medium text-snow">Latest runs</h2>
          <Link href="/dashboard/runs" className="text-sm text-accent-soft hover:text-snow">
            View all
          </Link>
        </div>
        <ul className="divide-y divide-line">
          {runs.slice(0, 8).map((run) => (
            <li key={run.id}>
              <Link
                href={`/dashboard/runs/${run.clientRunId}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-sm transition-colors hover:bg-ink-soft/70"
              >
                <span className="min-w-0 truncate font-medium text-snow">{run.agentName}</span>
                <span className="font-mono text-mute">{run.clientRunId.slice(0, 12)}…</span>
                <Badge variant={statusVariant(run.status)}>{run.status}</Badge>
                <span className="font-mono tabular text-fog">
                  {(run.scoreCard.overall ?? 0).toFixed(1)}
                </span>
              </Link>
            </li>
          ))}
          {runs.length === 0 && !error ? (
            <li className="px-5 py-10 text-sm text-mute">
              No synced runs yet. Run{" "}
              <code className="text-fog" translate="no">
                agent-eval-bench login
              </code>{" "}
              then{" "}
              <code className="text-fog" translate="no">
                agent-eval-bench run
              </code>
              .
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
