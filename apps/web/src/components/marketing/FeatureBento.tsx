import { Box, Cable, ChartColumnIncreasing, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    title: "Sandboxed Suites",
    body: "Docker or local sandboxes, YAML benchmarks, and validators that score agents the way production would.",
    icon: Box,
    className: "md:col-span-2",
    visual: (
      <div className="mt-8 grid grid-cols-3 gap-2">
        {["planning", "recovery", "safety"].map((dim) => (
          <div
            key={dim}
            className="rounded-xl border border-line bg-ink/60 px-3 py-4 text-center"
          >
            <p className="text-[10px] uppercase tracking-wider text-mute">{dim}</p>
            <p className="mt-1 font-mono text-lg text-snow">9.0</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "CLI Bridge",
    body: "Device-code login connects your terminal once. Every subsequent run syncs logs and scores.",
    icon: Cable,
    className: "",
    visual: (
      <pre className="mt-8 overflow-x-auto rounded-xl border border-line bg-ink/70 p-3 font-mono text-[11px] leading-5 text-fog">
        <code>{`agent-eval-bench login
agent-eval-bench run`}</code>
      </pre>
    ),
  },
  {
    title: "Run Explorer",
    body: "Inspect pass rates, per-benchmark validators, telemetry timelines, and agent leaderboards.",
    icon: ChartColumnIncreasing,
    className: "",
    visual: (
      <div className="mt-8 space-y-2">
        {["completed", "running", "failed"].map((status, i) => (
          <div
            key={status}
            className="flex items-center justify-between rounded-xl border border-line bg-ink/60 px-3 py-2 text-xs"
          >
            <span className="text-fog">suite-{i + 1}</span>
            <Badge variant={status === "failed" ? "bad" : status === "running" ? "warn" : "good"}>
              {status}
            </Badge>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Scorecards That Stick",
    body: "Nine dimensions — success, accuracy, planning, efficiency, verification, recovery, memory, safety, overall.",
    icon: ShieldCheck,
    className: "md:col-span-2",
    visual: (
      <div className="mt-8 flex flex-wrap gap-2">
        {["success", "accuracy", "efficiency", "safety", "overall"].map((dim) => (
          <Badge key={dim} variant="accent">
            {dim}
          </Badge>
        ))}
      </div>
    ),
  },
];

export function FeatureBento() {
  return (
    <section id="product" className="scroll-mt-20 py-24">
      <div className="container-wide">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-badge">Features</span>
          <h2 className="mt-5 text-balance font-display text-3xl font-semibold tracking-[-0.03em] text-snow sm:text-4xl">
            Everything you need to evaluate and launch
          </h2>
          <p className="mt-4 text-pretty text-mute">
            Keep the CLI fast and offline-first. When you want shared history, link your machine and
            every benchmark run syncs to the cloud.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className={`rounded-3xl border border-line bg-panel/50 p-6 sm:p-8 ${feature.className}`}
              >
                <div className="flex size-10 items-center justify-center rounded-xl border border-line bg-ink-soft">
                  <Icon aria-hidden="true" className="size-5 text-accent-soft" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-snow">
                  {feature.title}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-mute">{feature.body}</p>
                {feature.visual}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
