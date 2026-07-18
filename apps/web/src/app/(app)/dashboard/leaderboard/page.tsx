"use client";

import { useEffect, useState } from "react";
import { apiFetch, type LeaderboardRow } from "@/lib/api";

export default function LeaderboardPage() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ leaderboard: LeaderboardRow[] }>("/v1/leaderboard")
      .then((data) => setRows(data.leaderboard))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  return (
    <div className="animate-rise space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-snow">
          Leaderboard
        </h1>
        <p className="mt-2 text-sm text-mute">
          Aggregated from your completed synced runs — average and best overall scores by agent.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-bad" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-3xl border border-line bg-panel/40">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-mute">
            <tr className="border-b border-line">
              <th className="px-5 py-3 font-medium">#</th>
              <th className="px-5 py-3 font-medium">Agent</th>
              <th className="px-5 py-3 font-medium">Runs</th>
              <th className="px-5 py-3 font-medium">Avg</th>
              <th className="px-5 py-3 font-medium">Best</th>
              <th className="px-5 py-3 font-medium">Last run</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.agentName} className="border-b border-line/70 last:border-0">
                <td className="px-5 py-3 tabular text-mute">{i + 1}</td>
                <td className="px-5 py-3 text-snow">{row.agentName}</td>
                <td className="px-5 py-3 tabular text-fog">{row.runs}</td>
                <td className="px-5 py-3 font-mono tabular text-fog">
                  {row.avgOverall.toFixed(1)}
                </td>
                <td className="px-5 py-3 font-mono tabular text-fog">
                  {row.bestOverall.toFixed(1)}
                </td>
                <td className="px-5 py-3 text-mute">
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(row.lastRunAt))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && !error ? (
          <p className="px-5 py-8 text-sm text-mute">
            Sync completed runs to populate the leaderboard.
          </p>
        ) : null}
      </div>
    </div>
  );
}
