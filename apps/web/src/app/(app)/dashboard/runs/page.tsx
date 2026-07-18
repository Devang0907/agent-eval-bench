"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, type RunListItem } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string) {
  if (status === "completed") return "good" as const;
  if (status === "failed") return "bad" as const;
  if (status === "running") return "warn" as const;
  return "default" as const;
}

export default function RunsPage() {
  const [runs, setRuns] = useState<RunListItem[]>([]);
  const [agent, setAgent] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = agent ? `?agent=${encodeURIComponent(agent)}` : "";
    apiFetch<{ runs: RunListItem[] }>(`/v1/runs${q}`)
      .then((data) => setRuns(data.runs))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, [agent]);

  return (
    <div className="animate-rise space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-snow">Runs</h1>
        <p className="mt-2 text-sm text-mute">Filter and open synced benchmark suite runs.</p>
      </div>

      <label className="block max-w-xs text-sm">
        <span className="text-mute">Agent filter</span>
        <input
          name="agent"
          autoComplete="off"
          spellCheck={false}
          className="focus-ring mt-1 w-full rounded-xl border border-line bg-ink-soft px-3 py-2 text-snow"
          value={agent}
          onChange={(e) => setAgent(e.target.value)}
          placeholder="e.g. mock…"
        />
      </label>

      {error ? (
        <p className="text-sm text-bad" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-3xl border border-line bg-panel/40">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-mute">
            <tr className="border-b border-line">
              <th className="px-5 py-3 font-medium">Agent</th>
              <th className="px-5 py-3 font-medium">Run</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Overall</th>
              <th className="px-5 py-3 font-medium">Benchmarks</th>
              <th className="px-5 py-3 font-medium">Completed</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id} className="border-b border-line/70 last:border-0 hover:bg-ink-soft/50">
                <td className="px-5 py-3 text-snow">{run.agentName}</td>
                <td className="px-5 py-3">
                  <Link
                    href={`/dashboard/runs/${run.clientRunId}`}
                    className="font-mono text-accent-soft hover:text-snow"
                  >
                    {run.clientRunId.slice(0, 16)}
                  </Link>
                </td>
                <td className="px-5 py-3">
                  <Badge variant={statusVariant(run.status)}>{run.status}</Badge>
                </td>
                <td className="px-5 py-3 font-mono tabular text-fog">
                  {(run.scoreCard.overall ?? 0).toFixed(1)}
                </td>
                <td className="px-5 py-3 tabular text-mute">{run._count.benchmarks}</td>
                <td className="px-5 py-3 text-mute">
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(run.completedAt))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {runs.length === 0 && !error ? (
          <p className="px-5 py-8 text-sm text-mute">No runs match this filter.</p>
        ) : null}
      </div>
    </div>
  );
}
