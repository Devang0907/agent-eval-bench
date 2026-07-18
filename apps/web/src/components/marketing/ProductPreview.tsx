"use client";

import { useState } from "react";
import {
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  KeyRound,
  LayoutDashboard,
  Link2,
  ListOrdered,
  Settings,
  Terminal,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/BrandMark";
import { cn } from "@/lib/utils";

type Tab = "Overview" | "Runs" | "Leaderboard" | "Settings" | "Link CLI";

const nav: { icon: typeof LayoutDashboard; label: Tab }[] = [
  { icon: LayoutDashboard, label: "Overview" },
  { icon: ListOrdered, label: "Runs" },
  { icon: Trophy, label: "Leaderboard" },
  { icon: Settings, label: "Settings" },
  { icon: Terminal, label: "Link CLI" },
];

const runs = [
  { agent: "claude-sonnet", score: 86.4, status: "completed" as const, id: "run_8f2a91…" },
  { agent: "gpt-codex", score: 81.2, status: "completed" as const, id: "run_3c91be…" },
  { agent: "mock-local", score: 64.0, status: "running" as const, id: "run_b10e44…" },
  { agent: "cursor-agent", score: 79.8, status: "completed" as const, id: "run_a2f0c1…" },
  { agent: "opencode", score: 77.1, status: "completed" as const, id: "run_d4e12f…" },
];

const leaderboard = [
  { rank: 1, agent: "claude-sonnet", score: 86.4, delta: "+2.1" },
  { rank: 2, agent: "gpt-codex", score: 81.2, delta: "+0.4" },
  { rank: 3, agent: "cursor-agent", score: 79.8, delta: "-0.8" },
  { rank: 4, agent: "opencode", score: 77.1, delta: "+1.2" },
  { rank: 5, agent: "mock-local", score: 64.0, delta: "—" },
];

const cliLines = [
  { tone: "mute", text: "$ agent-eval-bench login" },
  { tone: "fog", text: "Device code: ABCD-EFGH" },
  { tone: "mute", text: "Open http://localhost:3000/device to approve" },
  { tone: "good", text: "✓ Machine linked · sync enabled" },
  { tone: "mute", text: "$ agent-eval-bench run context -a mock" },
  { tone: "accent", text: "→ sandbox · scoring · report sinks" },
  { tone: "good", text: "✓ Suite complete · score 0.91 · 4.2s" },
];

type MetricKey = "runs" | "avg" | "events";

const metrics: Record<
  MetricKey,
  { label: string; value: string; delta: string; series: number[]; unit: string }
> = {
  runs: {
    label: "Synced runs",
    value: "24",
    delta: "+6 this week",
    series: [8, 10, 12, 11, 14, 16, 15, 18, 19, 21, 22, 24],
    unit: "runs",
  },
  avg: {
    label: "Avg overall",
    value: "78.3",
    delta: "+2.4 pts",
    series: [62, 64, 67, 66, 70, 72, 71, 74, 75, 76, 77.5, 78.3],
    unit: "score",
  },
  events: {
    label: "Events",
    value: "1.2k",
    delta: "+180 today",
    series: [420, 480, 510, 560, 620, 700, 740, 820, 900, 980, 1100, 1200],
    unit: "events",
  },
};

function MetricChart({ series, label }: { series: number[]; label: string }) {
  const w = 320;
  const h = 120;
  const pad = 8;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min || 1;
  const points = series
    .map((v, i) => {
      const x = pad + (i / (series.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");
  const area = `M ${pad},${h - pad} L ${points.replace(/ /g, " L ")} L ${w - pad},${h - pad} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-28 w-full sm:h-32"
      role="img"
      aria-label={`${label} trend chart`}
    >
      <defs>
        <linearGradient id="metricFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(80, 180, 255, 0.35)" />
          <stop offset="100%" stopColor="rgba(80, 180, 255, 0)" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={pad}
          x2={w - pad}
          y1={pad + t * (h - pad * 2)}
          y2={pad + t * (h - pad * 2)}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}
      <path d={area} fill="url(#metricFill)" />
      <polyline
        points={points}
        fill="none"
        stroke="rgb(110, 200, 255)"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {series.map((v, i) => {
        const x = pad + (i / (series.length - 1)) * (w - pad * 2);
        const y = h - pad - ((v - min) / range) * (h - pad * 2);
        if (i !== series.length - 1) return null;
        return <circle key={i} cx={x} cy={y} r="3.5" fill="#fff" stroke="rgb(80,180,255)" strokeWidth="2" />;
      })}
    </svg>
  );
}

function OverviewPanel() {
  const [metric, setMetric] = useState<MetricKey>("runs");
  const active = metrics[metric];

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[1.15fr_1fr]">
      <div className="product-glass-card flex min-h-0 flex-col rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-1 rounded-full border border-white/10 bg-black/30 p-1">
          {(Object.keys(metrics) as MetricKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setMetric(key)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors sm:text-xs",
                metric === key
                  ? "bg-white/10 text-snow shadow-[0_0_20px_-6px_rgba(80,190,255,0.6)]"
                  : "text-mute hover:text-fog",
              )}
            >
              {metrics[key].label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-mute">{active.label}</p>
            <p className="mt-1 text-3xl font-semibold tabular text-snow sm:text-4xl">{active.value}</p>
            <p className="mt-1 text-xs text-good">{active.delta}</p>
          </div>
          <p className="pb-1 text-[11px] text-mute">Last 12 syncs · {active.unit}</p>
        </div>

        <div className="mt-3 min-h-0 flex-1">
          <MetricChart series={active.series} label={active.label} />
        </div>
      </div>

      <div className="product-glass-card flex min-h-0 flex-col rounded-2xl p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-snow">Latest runs</p>
          <Badge variant="accent" showDot>
            Live sync
          </Badge>
        </div>
        <ul className="divide-y divide-white/[0.06] overflow-auto">
          {runs.slice(0, 4).map((run) => (
            <li key={run.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="min-w-0 truncate font-medium text-snow">{run.agent}</span>
              <span className="hidden font-mono text-xs text-mute sm:inline">{run.id}</span>
              <Badge variant={run.status === "running" ? "warn" : "good"} showDot>
                {run.status === "running" ? "Running" : "Passed"}
              </Badge>
              <span className="font-mono tabular text-fog">{run.score.toFixed(1)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RunsPanel() {
  return (
    <div className="product-glass-card flex h-full min-h-0 flex-col rounded-2xl p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-snow">All runs</p>
          <p className="mt-0.5 text-xs text-mute">Synced from CLI · last 7 days</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="accent" showDot>
            5 agents
          </Badge>
          <Badge>All filters</Badge>
        </div>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-mute">
            <tr className="border-b border-white/[0.08]">
              <th className="pb-2 font-medium">Agent</th>
              <th className="hidden pb-2 font-medium sm:table-cell">Run ID</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 text-right font-medium">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {runs.map((run) => (
              <tr key={run.id} className="text-fog">
                <td className="py-3 font-medium text-snow">{run.agent}</td>
                <td className="hidden py-3 font-mono text-xs text-mute sm:table-cell">{run.id}</td>
                <td className="py-3">
                  <Badge variant={run.status === "running" ? "warn" : "good"} showDot>
                    {run.status === "running" ? "Running" : "Passed"}
                  </Badge>
                </td>
                <td className="py-3 text-right font-mono tabular text-snow">{run.score.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeaderboardPanel() {
  return (
    <div className="product-glass-card flex h-full min-h-0 flex-col rounded-2xl p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-snow">Leaderboard</p>
          <p className="mt-0.5 text-xs text-mute">Weighted score · context suite</p>
        </div>
        <Badge variant="accent" showDot>
          Live
        </Badge>
      </div>
      <ul className="divide-y divide-white/[0.06] overflow-auto">
        {leaderboard.map((row) => (
          <li key={row.agent} className="flex items-center gap-4 py-3 text-sm">
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full border text-xs font-semibold",
                row.rank === 1
                  ? "border-accent/40 bg-accent/15 text-accent-soft"
                  : "border-white/10 bg-white/[0.03] text-mute",
              )}
            >
              {row.rank}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium text-snow">{row.agent}</span>
            <span className="text-xs text-mute">{row.delta}</span>
            <span className="font-mono tabular text-snow">{row.score.toFixed(1)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SettingsPanel() {
  return (
    <div className="grid h-full gap-4 md:grid-cols-2">
      <div className="product-glass-card rounded-2xl p-5">
        <p className="text-sm font-medium text-snow">Profile</p>
        <p className="mt-1 text-xs text-mute">Account used for cloud sync</p>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between border-b border-white/[0.06] pb-3">
            <span className="text-mute">Email</span>
            <span className="text-snow">you@agentevalbench.dev</span>
          </div>
          <div className="flex justify-between border-b border-white/[0.06] pb-3">
            <span className="text-mute">Plan</span>
            <span className="text-snow">Free</span>
          </div>
          <div className="flex justify-between">
            <span className="text-mute">Region</span>
            <span className="text-snow">US East</span>
          </div>
        </div>
      </div>
      <div className="product-glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2">
          <KeyRound className="size-4 text-accent-soft" />
          <p className="text-sm font-medium text-snow">API tokens</p>
        </div>
        <p className="mt-1 text-xs text-mute">Use with CLI sync and CI</p>
        <div className="mt-5 rounded-xl border border-white/[0.08] bg-ink/50 px-3 py-2.5 font-mono text-xs text-fog">
          aeb_live_••••••••••••3f91
        </div>
        <button
          type="button"
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-fog hover:text-snow"
        >
          <Copy className="size-3.5" />
          Copy token
        </button>
      </div>
    </div>
  );
}

function CliPanel() {
  return (
    <div className="product-glass-card flex h-full min-h-0 flex-col rounded-2xl p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="size-4 text-accent-soft" />
          <p className="text-sm font-medium text-snow">Link CLI</p>
        </div>
        <Badge variant="good" showDot>
          Connected
        </Badge>
      </div>
      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-white/[0.08] bg-[#07090d] p-4 font-mono text-[12px] leading-6 sm:text-[13px]">
        {cliLines.map((line, i) => (
          <p
            key={i}
            className={cn(
              line.tone === "good" && "text-good",
              line.tone === "accent" && "text-accent-soft",
              line.tone === "fog" && "text-fog",
              line.tone === "mute" && "text-mute",
            )}
          >
            {line.text}
          </p>
        ))}
      </div>
      <p className="mt-3 text-xs text-mute">
        Run <span className="font-mono text-fog">agent-eval-bench login</span> then approve at{" "}
        <span className="text-fog">/device</span>.
      </p>
    </div>
  );
}

function PanelBody({ tab }: { tab: Tab }) {
  switch (tab) {
    case "Overview":
      return <OverviewPanel />;
    case "Runs":
      return <RunsPanel />;
    case "Leaderboard":
      return <LeaderboardPanel />;
    case "Settings":
      return <SettingsPanel />;
    case "Link CLI":
      return <CliPanel />;
  }
}

const panelHints: Record<Tab, string> = {
  Overview: "Ask about scorecards, sync status, or latest runs…",
  Runs: "Filter runs by agent, status, or suite…",
  Leaderboard: "Compare agents across dimensions…",
  Settings: "Update tokens, profile, or sync prefs…",
  "Link CLI": "Paste a device code or run login help…",
};

export function ProductPreview() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <div className="product-frame product-frame--glass relative mx-auto w-full max-w-6xl lg:max-w-7xl">
      {/* Header */}
      <div className="relative flex items-center gap-3 border-b border-white/[0.08] px-4 py-3.5 sm:px-6">
        <BrandMark
          showWordmark
          className="shrink-0 [&_span]:hidden sm:[&_span]:inline"
          markClassName="size-4"
        />
        <nav
          aria-label="Preview navigation"
          className="mx-auto flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-white/10 bg-black/40 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md"
        >
          {nav.map((item) => {
            const Icon = item.icon;
            const active = tab === item.label;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setTab(item.label);
                  setPanelOpen(true);
                }}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] transition-colors sm:px-3 sm:text-xs",
                  active
                    ? "bg-white/10 text-snow shadow-[0_0_24px_-6px_rgba(80,190,255,0.75)]"
                    : "text-mute hover:bg-white/[0.04] hover:text-fog",
                )}
              >
                <Icon className="size-3.5" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>
        {/* Spacer mirrors brand width so nav stays centered */}
        <div className="hidden w-[140px] shrink-0 sm:block" aria-hidden="true" />
      </div>

      {/* Body */}
      <div className="relative min-h-[420px] p-4 pb-28 sm:min-h-[480px] sm:p-6 sm:pb-32 lg:min-h-[520px]">
        <div className="h-full min-h-[340px] sm:min-h-[380px]">
          <PanelBody tab={tab} />
        </div>

        {/* Floating command panel */}
        <div className="absolute inset-x-4 -bottom-[30px] z-10 sm:inset-x-8 sm:-bottom-[30px]">
          <div
            className={cn(
              "overflow-hidden rounded-2xl border border-cyan-300/35 bg-[#0a0e14]/75 shadow-[0_0_0_1px_rgba(120,210,255,0.12),0_20px_60px_-20px_rgba(0,0,0,0.8),0_0_40px_-12px_rgba(80,180,255,0.35)] backdrop-blur-xl transition-[height] duration-300",
              panelOpen ? "max-h-56" : "max-h-14",
            )}
          >
            {panelOpen ? (
              <div className="border-b border-white/[0.06] px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-6 items-center justify-center rounded-full bg-accent/20 text-accent-soft">
                    <Check className="size-3.5" strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-snow">
                      {tab === "Link CLI"
                        ? "CLI linked · ready to sync runs"
                        : tab === "Leaderboard"
                          ? "claude-sonnet leads context suite"
                          : tab === "Runs"
                            ? "5 runs synced · 1 in progress"
                            : tab === "Settings"
                              ? "API token active · Free plan"
                              : "Dashboard live · 24 runs synced"}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-mute">
                      {tab === "Overview" &&
                        "Sandboxed suites scoring across nine dimensions. Open Runs for the full table."}
                      {tab === "Runs" &&
                        "mock-local is still running. Scores update as validators finish."}
                      {tab === "Leaderboard" &&
                        "Rankings use WeightedScorer across planning, context, and tool usage."}
                      {tab === "Settings" &&
                        "Rotate tokens anytime. CLI stays offline-first until you sync."}
                      {tab === "Link CLI" &&
                        "Device approval complete. New local runs can sync to this account."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPanelOpen(false)}
                    className="rounded-lg p-1 text-mute hover:bg-white/[0.06] hover:text-snow"
                    aria-label="Collapse panel"
                  >
                    <ChevronDown className="size-4" />
                  </button>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <Link2 className="size-4 shrink-0 text-mute" />
              <span className="min-w-0 flex-1 truncate text-sm text-mute">{panelHints[tab]}</span>
              <span className="hidden items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-mute sm:inline-flex">
                Agent Eval Bench
                <ChevronDown className="size-3" />
              </span>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#7ec8ff] to-[#3b9eff] text-ink shadow-[0_0_20px_-4px_rgba(80,180,255,0.8)]">
                <ArrowUp className="size-3.5" strokeWidth={2.5} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
