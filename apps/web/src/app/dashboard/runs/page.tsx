"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, type RunListItem } from "@/lib/api";

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
    <div className="animate-rise">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-snow">Runs</h1>
      <p className="mt-2 text-sm text-mute">Filter and open synced benchmark suite runs.</p>

      <label className="mt-6 block max-w-xs text-sm">
        <span className="text-mute">Agent filter</span>
        <input
          className="focus-ring mt-1 w-full rounded-xl border border-line bg-ink-soft px-3 py-2 text-snow"
          value={agent}
          onChange={(e) => setAgent(e.target.value)}
          placeholder="e.g. mock"
        />
      </label>

      {error && <p className="mt-4 text-sm text-bad">{error}</p>}

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-mute">
            <tr className="border-b border-line">
              <th className="py-2 font-medium">Agent</th>
              <th className="py-2 font-medium">Run</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Overall</th>
              <th className="py-2 font-medium">Benchmarks</th>
              <th className="py-2 font-medium">Completed</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id} className="border-b border-line/70 hover:bg-panel/30">
                <td className="py-3 text-snow">{run.agentName}</td>
                <td className="py-3">
                  <Link
                    href={`/dashboard/runs/${run.clientRunId}`}
                    className="font-mono text-accent-soft hover:text-snow"
                  >
                    {run.clientRunId.slice(0, 16)}
                  </Link>
                </td>
                <td className="py-3 text-fog">{run.status}</td>
                <td className="py-3 font-mono text-fog">
                  {(run.scoreCard.overall ?? 0).toFixed(1)}
                </td>
                <td className="py-3 text-mute">{run._count.benchmarks}</td>
                <td className="py-3 text-mute">
                  {new Date(run.completedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {runs.length === 0 && !error && (
          <p className="mt-6 text-sm text-mute">No runs match this filter.</p>
        )}
      </div>
    </div>
  );
}
