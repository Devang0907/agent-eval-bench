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
    <div className="animate-rise">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-snow">Leaderboard</h1>
      <p className="mt-2 text-sm text-mute">
        Aggregated from your completed synced runs — average and best overall scores by agent.
      </p>

      {error && <p className="mt-4 text-sm text-bad">{error}</p>}

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-mute">
            <tr className="border-b border-line">
              <th className="py-2 font-medium">#</th>
              <th className="py-2 font-medium">Agent</th>
              <th className="py-2 font-medium">Runs</th>
              <th className="py-2 font-medium">Avg</th>
              <th className="py-2 font-medium">Best</th>
              <th className="py-2 font-medium">Last run</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.agentName} className="border-b border-line/70">
                <td className="py-3 text-mute">{i + 1}</td>
                <td className="py-3 text-snow">{row.agentName}</td>
                <td className="py-3 text-fog">{row.runs}</td>
                <td className="py-3 font-mono text-fog">{row.avgOverall.toFixed(1)}</td>
                <td className="py-3 font-mono text-fog">{row.bestOverall.toFixed(1)}</td>
                <td className="py-3 text-mute">{new Date(row.lastRunAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && !error && (
          <p className="mt-6 text-sm text-mute">Sync completed runs to populate the leaderboard.</p>
        )}
      </div>
    </div>
  );
}
