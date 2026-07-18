import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/BrandMark";
import { LayoutDashboard, ListOrdered, Trophy, Settings, Terminal } from "lucide-react";

const nav = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: ListOrdered, label: "Runs", active: false },
  { icon: Trophy, label: "Leaderboard", active: false },
  { icon: Settings, label: "Settings", active: false },
  { icon: Terminal, label: "Link CLI", active: false },
];

const runs = [
  { agent: "claude-sonnet", score: 86.4, status: "completed", id: "run_8f2a91…" },
  { agent: "gpt-codex", score: 81.2, status: "completed", id: "run_3c91be…" },
  { agent: "mock-local", score: 64.0, status: "running", id: "run_b10e44…" },
  { agent: "cursor-agent", score: 79.8, status: "completed", id: "run_a2f0c1…" },
];

export function ProductPreview() {
  return (
    <div
      className="product-frame relative mx-auto w-full max-w-5xl"
      style={{ width: "100%", minHeight: 360 }}
      aria-hidden="true"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/[0.06] to-transparent"
        aria-hidden="true"
      />

      <div className="relative flex items-center justify-between border-b border-white/[0.08] px-4 py-3.5 sm:px-5">
        <BrandMark showWordmark={false} markClassName="size-4" />
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-ink/70 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <span
                key={item.label}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] ${
                  item.active
                    ? "bg-white/10 text-snow shadow-[0_0_20px_-6px_rgba(110,192,255,0.6)]"
                    : "text-mute"
                }`}
              >
                <Icon className="size-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </span>
            );
          })}
        </div>
        <span className="size-7 rounded-full bg-gradient-to-br from-panel to-ink-soft ring-1 ring-white/10" />
      </div>

      <div className="relative grid gap-4 p-4 sm:p-5 md:grid-cols-[1fr_1.45fr]">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Synced runs", value: "24" },
            { label: "Avg overall", value: "78.3" },
            { label: "Events", value: "1.2k" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-panel/40 p-3"
            >
              <p className="text-[10px] uppercase tracking-wider text-mute">{stat.label}</p>
              <p className="mt-1 font-display text-xl font-semibold tabular text-snow">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-panel/30 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-snow">Latest runs</p>
            <Badge variant="accent">Live sync</Badge>
          </div>
          <ul className="divide-y divide-white/[0.06]">
            {runs.map((run) => (
              <li
                key={run.id}
                className="flex items-center justify-between gap-3 py-2.5 text-xs"
              >
                <span className="min-w-0 truncate font-medium text-snow">{run.agent}</span>
                <span className="hidden font-mono text-mute sm:inline">{run.id}</span>
                <Badge variant={run.status === "running" ? "warn" : "good"}>{run.status}</Badge>
                <span className="font-mono tabular text-fog">{run.score.toFixed(1)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
