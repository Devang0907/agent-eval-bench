"use client";

import {
  Box,
  Cable,
  ChartColumnIncreasing,
  Database,
  Flame,
  Leaf,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Reveal, RevealItem, RevealStagger } from "@/components/motion/Reveal";

export function FeatureBento() {
  const reduced = useReducedMotion();

  return (
    <section id="product" className="scroll-mt-20 py-28">
      <div className="container-wide">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="section-badge">Features</span>
          <h2 className="mt-5 text-balance font-display text-3xl font-semibold tracking-[-0.03em] text-snow sm:text-5xl">
            Everything you need to evaluate and launch
          </h2>
          <p className="mt-4 text-pretty text-mute">
            Keep the CLI fast and offline-first. When you want shared history, link your machine and
            every benchmark run syncs to the cloud.
          </p>
        </Reveal>

        <RevealStagger className="mt-16 grid gap-4 lg:grid-cols-2">
          {/* Wide visual card */}
          <RevealItem className="lg:col-span-2">
            <motion.article
              className="group relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-panel/50 p-6 sm:p-10 lg:grid lg:grid-cols-2 lg:gap-10"
              whileHover={reduced ? undefined : { y: -3 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
            >
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_80%_20%,rgba(62,160,255,0.12),transparent_55%)]"
                aria-hidden="true"
              />
              <div className="relative flex flex-col justify-center">
                <div className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-ink-soft">
                  <Box aria-hidden="true" className="size-5 text-accent-soft" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-semibold tracking-[-0.02em] text-snow">
                  Visual Run Explorer
                </h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-mute">
                  Inspect pass rates, per-benchmark validators, telemetry timelines, and agent
                  leaderboards in one glass surface.
                </p>
              </div>
              <div className="relative mt-8 lg:mt-0">
                <div className="rounded-2xl border border-white/10 bg-ink/70 p-4 font-mono text-[11px] leading-5 text-fog shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <div className="mb-3 flex gap-4 text-mute">
                    {["11 Jan", "12 Jan", "13 Jan", "14 Jan", "15 Jan"].map((d) => (
                      <span key={d} className={d === "14 Jan" ? "text-snow" : ""}>
                        {d}
                      </span>
                    ))}
                  </div>
                  <div className="relative h-28 rounded-xl border border-dashed border-white/10 bg-[linear-gradient(transparent_23px,rgba(255,255,255,0.03)_24px),linear-gradient(90deg,transparent_23px,rgba(255,255,255,0.03)_24px)] bg-[size:24px_24px]">
                    <span className="absolute left-4 top-6 rounded-md border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-mute">
                      Development
                    </span>
                    <span className="absolute left-1/2 top-10 -translate-x-1/2 rounded-md border border-accent/25 bg-accent/[0.12] px-2 py-0.5 text-[10px] font-medium text-accent-soft">
                      Launch
                    </span>
                    <span className="absolute bottom-5 right-6 rounded-md border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-mute/80">
                      Maintenance
                    </span>
                  </div>
                </div>
              </div>
            </motion.article>
          </RevealItem>

          <RevealItem>
            <motion.article
              className="group relative h-full overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-panel/50 p-6 sm:p-8"
              whileHover={reduced ? undefined : { y: -4 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.04] to-transparent"
                aria-hidden="true"
              />
              <div className="relative">
                <Badge variant="accent" showDot className="mb-4">
                  <Zap aria-hidden="true" className="size-3" />
                  AI optimizes suite structure…
                </Badge>
                <div className="mb-5 flex flex-wrap gap-2">
                  {[Database, Leaf, Flame, Zap, Cable].map((Icon, i) => (
                    <span
                      key={i}
                      className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-ink-soft text-fog"
                    >
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                  ))}
                </div>
                <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-snow">
                  Sandboxed Suites & Integrations
                </h3>
                <p className="mt-2 text-sm leading-6 text-mute">
                  Docker or local sandboxes, YAML benchmarks, and validators that score agents the
                  way production would.
                </p>
              </div>
            </motion.article>
          </RevealItem>

          <RevealItem>
            <motion.article
              className="group relative h-full overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-panel/50 p-6 sm:p-8"
              whileHover={reduced ? undefined : { y: -4 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.04] to-transparent"
                aria-hidden="true"
              />
              <div className="relative">
                <div className="mb-5 space-y-2 rounded-2xl border border-white/10 bg-ink/60 p-3">
                  <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-white/10 px-3 py-2 text-xs text-snow">
                    Run the recovery suite against mock-local
                  </div>
                  <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-white/10 bg-panel px-3 py-2 text-xs text-fog">
                    Got it. Syncing scorecard + telemetry when the run completes.
                  </div>
                </div>
                <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-ink-soft">
                  <Cable aria-hidden="true" className="size-5 text-accent-soft" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold tracking-[-0.02em] text-snow">
                  CLI Bridge
                </h3>
                <p className="mt-2 text-sm leading-6 text-mute">
                  Device-code login connects your terminal once. Every subsequent run syncs logs and
                  scores.
                </p>
              </div>
            </motion.article>
          </RevealItem>

          <RevealItem className="lg:col-span-2">
            <motion.article
              className="group relative overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-panel/50 p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8"
              whileHover={reduced ? undefined : { y: -3 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
            >
              <div className="relative max-w-md">
                <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-ink-soft">
                  <ShieldCheck aria-hidden="true" className="size-5 text-accent-soft" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold tracking-[-0.02em] text-snow">
                  Scorecards That Stick
                </h3>
                <p className="mt-2 text-sm leading-6 text-mute">
                  Nine dimensions — success, accuracy, planning, efficiency, verification, recovery,
                  memory, safety, overall.
                </p>
              </div>
              <div className="relative mt-6 flex flex-wrap gap-2 sm:mt-0 sm:justify-end">
                {["Success", "Accuracy", "Efficiency", "Safety", "Overall"].map((dim) => (
                  <Badge key={dim} variant="accent">
                    <ChartColumnIncreasing aria-hidden="true" className="size-3" />
                    {dim}
                  </Badge>
                ))}
              </div>
            </motion.article>
          </RevealItem>
        </RevealStagger>
      </div>
    </section>
  );
}
