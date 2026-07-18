"use client";

import type { ReactNode } from "react";
import {
  Box,
  Cable,
  Code2,
  Database,
  Flame,
  Leaf,
  MessageSquare,
  Rocket,
  Settings,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Reveal, RevealItem, RevealStagger } from "@/components/motion/Reveal";

function CodeNoise({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden opacity-[0.07] ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 font-mono text-[10px] leading-4 text-snow [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]">
        {Array.from({ length: 12 }).map((_, row) => (
          <p key={row} className="whitespace-nowrap tracking-widest">
            {Array.from({ length: 18 }).map((_, col) => (
              <span key={col} className="mr-2">
                {["a7", "0x", "fn", "λ", "42", "::", ">>", "ok"][(row + col) % 8]}
              </span>
            ))}
          </p>
        ))}
      </div>
    </div>
  );
}

function CardShell({
  children,
  className = "",
  reduced,
}: {
  children: ReactNode;
  className?: string;
  reduced: boolean | null;
}) {
  return (
    <motion.article
      className={`group relative h-full overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#0c0e12] ${className}`}
      whileHover={reduced ? undefined : { y: -3 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"
        aria-hidden="true"
      />
      {children}
    </motion.article>
  );
}

function SuitesGraphic() {
  return (
    <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080a0e] sm:h-48">
      <CodeNoise />
      <div
        className="pointer-events-none absolute inset-x-8 top-0 h-20 bg-gradient-to-b from-accent/20 to-transparent blur-2xl"
        aria-hidden="true"
      />

      <span className="absolute left-[18%] top-8 flex size-10 items-center justify-center rounded-xl border border-white/10 bg-black/50 text-fog backdrop-blur-sm">
        <Leaf className="size-4" aria-hidden="true" />
      </span>
      <span className="absolute right-[20%] top-10 flex size-10 items-center justify-center rounded-xl border border-white/10 bg-black/50 text-fog backdrop-blur-sm">
        <Zap className="size-4" aria-hidden="true" />
      </span>
      <span className="absolute bottom-8 left-[22%] flex size-10 items-center justify-center rounded-xl border border-white/10 bg-black/50 text-fog backdrop-blur-sm">
        <Database className="size-4" aria-hidden="true" />
      </span>
      <span className="absolute bottom-7 right-[18%] flex size-10 items-center justify-center rounded-xl border border-white/10 bg-black/50 text-fog backdrop-blur-sm">
        <Flame className="size-4" aria-hidden="true" />
      </span>

      <div className="relative z-[1] inline-flex items-center gap-2 rounded-full border border-white/15 bg-gradient-to-b from-white/[0.1] to-white/[0.03] px-4 py-2 text-sm font-medium text-snow shadow-[0_0_32px_-8px_rgba(80,180,255,0.55)] backdrop-blur-md">
        <Code2 className="size-3.5 text-accent-soft" aria-hidden="true" />
        Suites
      </div>
    </div>
  );
}

function CliGraphic() {
  return (
    <div className="relative flex h-44 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080a0e] sm:h-48">
      <CodeNoise />
      <div className="relative z-[1] flex w-full gap-3 p-3 sm:p-4">
        <div className="flex shrink-0 flex-col gap-2 rounded-2xl border border-white/[0.08] bg-black/40 p-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent/20 text-accent-soft">
            <MessageSquare className="size-4" aria-hidden="true" />
          </span>
          <span className="flex size-9 items-center justify-center rounded-xl text-mute">
            <Terminal className="size-4" aria-hidden="true" />
          </span>
          <span className="flex size-9 items-center justify-center rounded-xl text-mute">
            <Settings className="size-4" aria-hidden="true" />
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2.5">
          <div className="ml-auto max-w-[92%] rounded-2xl rounded-br-md bg-white/[0.08] px-3 py-2 text-[11px] leading-relaxed text-snow sm:text-xs">
            Run the recovery suite against mock-local
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/15 text-[10px] font-semibold text-accent-soft">
              A
            </span>
            <div className="max-w-[95%] rounded-2xl rounded-bl-md border border-white/10 bg-[#12161e] px-3 py-2 text-[11px] leading-relaxed text-fog sm:text-xs">
              Got it. Syncing scorecard + telemetry when the run completes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExplorerGraphic() {
  const dates = ["11 Jan", "12 Jan", "13 Jan", "14 Jan", "15 Jan", "16 Jan", "17 Jan"];

  return (
    <div className="relative h-52 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080a0e] p-4 sm:h-56 sm:p-5">
      <CodeNoise />
      <div className="relative z-[1]">
        <div className="mb-4 flex items-center justify-between gap-1 text-[11px] text-mute">
          {dates.map((d) => (
            <span
              key={d}
              className={
                d === "14 Jan"
                  ? "rounded-full bg-white/10 px-2.5 py-1 font-medium text-snow"
                  : "px-1"
              }
            >
              {d}
            </span>
          ))}
        </div>

        <div className="relative h-32 rounded-xl border border-white/[0.06] bg-[linear-gradient(transparent_23px,rgba(255,255,255,0.03)_24px),linear-gradient(90deg,transparent_23px,rgba(255,255,255,0.03)_24px)] bg-[size:24px_24px]">
          {/* Glow column for launch day */}
          <div
            className="absolute bottom-0 left-[42%] top-0 w-px bg-gradient-to-b from-accent via-accent/80 to-transparent shadow-[0_0_18px_rgba(80,180,255,0.9)]"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-[42%] top-0 w-16 -translate-x-1/2 bg-gradient-to-b from-accent/25 via-accent/5 to-transparent"
            aria-hidden="true"
          />

          <span className="absolute left-3 top-5 rounded-md border border-white/10 bg-[#12161e] px-2.5 py-1 text-[10px] font-medium text-mute">
            Development
          </span>
          <span className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-accent/40 bg-accent/15 px-3 py-1.5 text-[11px] font-semibold text-accent-soft shadow-[0_0_28px_rgba(80,180,255,0.45)]">
            <Rocket className="size-3.5" aria-hidden="true" />
            Launch!
          </span>
          <span className="absolute bottom-4 right-4 rounded-md border border-white/10 bg-[#12161e]/90 px-2.5 py-1 text-[10px] font-medium text-mute/80">
            Maintenance
          </span>
        </div>
      </div>
    </div>
  );
}

function InterfaceGraphic() {
  return (
    <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.06] bg-[#080a0e] sm:h-52">
      <CodeNoise />
      <div className="relative z-[1] w-[92%] max-w-md overflow-hidden rounded-xl border border-white/10 bg-[#0b0f16] shadow-[0_0_40px_-12px_rgba(80,180,255,0.35)]">
        <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-3 py-2">
          <span className="size-1.5 rounded-full bg-white/20" />
          <span className="size-1.5 rounded-full bg-white/20" />
          <span className="size-1.5 rounded-full bg-white/20" />
        </div>
        <div className="relative flex h-32 items-center justify-center gap-6 px-4">
          <span className="flex size-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-mute/50">
            <Database className="size-5" aria-hidden="true" />
          </span>
          <svg
            className="absolute left-[22%] top-1/2 h-10 w-16 -translate-y-1/2 text-white/15"
            viewBox="0 0 64 40"
            fill="none"
            aria-hidden="true"
          >
            <path d="M2 20 C20 20, 20 6, 40 6" stroke="currentColor" strokeDasharray="3 3" />
          </svg>
          <span className="relative z-[1] flex size-16 items-center justify-center rounded-2xl border border-accent/40 bg-accent/10 text-snow shadow-[0_0_36px_-4px_rgba(80,180,255,0.7)]">
            <Box className="size-7 text-accent-soft" aria-hidden="true" />
          </span>
          <svg
            className="absolute right-[22%] top-1/2 h-10 w-16 -translate-y-1/2 text-white/15"
            viewBox="0 0 64 40"
            fill="none"
            aria-hidden="true"
          >
            <path d="M62 20 C44 20, 44 34, 24 34" stroke="currentColor" strokeDasharray="3 3" />
          </svg>
          <span className="flex size-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-mute/50">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </div>
  );
}

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
          <p className="mt-4 text-pretty text-sm text-mute sm:text-base">
            Keep the CLI fast and offline-first. When you want shared history, link your machine and
            every benchmark run syncs to the cloud.
          </p>
        </Reveal>

        <RevealStagger className="mt-16 grid gap-4 lg:grid-cols-2">
          {/* Wide visual interface — reference style */}
          <RevealItem className="lg:col-span-2">
            <CardShell
              reduced={reduced}
              className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:items-center lg:gap-10 lg:p-10"
            >
              <div className="relative order-2 lg:order-1">
                <h3 className="font-display text-2xl font-semibold tracking-[-0.02em] text-snow sm:text-[1.75rem]">
                  Visual Run Explorer
                </h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-mute">
                  Inspect pass rates, per-benchmark validators, telemetry timelines, and agent
                  leaderboards in one glass surface.
                </p>
              </div>
              <div className="relative order-1 lg:order-2">
                <InterfaceGraphic />
              </div>
            </CardShell>
          </RevealItem>

          {/* Suites card — graphic on top */}
          <RevealItem>
            <CardShell reduced={reduced} className="p-4 sm:p-5">
              <SuitesGraphic />
              <div className="px-2 pb-3 pt-6 sm:px-3">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/[0.12] px-3 py-1.5 text-[11px] font-medium text-accent-soft shadow-[0_0_24px_-6px_rgba(80,180,255,0.55)]">
                  <span className="flex size-3.5 items-center justify-center">
                    <span className="size-1.5 animate-pulse rounded-full bg-accent-soft" />
                  </span>
                  <Zap className="size-3" aria-hidden="true" />
                  AI optimizes suite structure…
                </div>
                <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-snow">
                  Sandboxed Suites & Integrations
                </h3>
                <p className="mt-2 text-sm leading-6 text-mute">
                  Docker or local sandboxes, YAML benchmarks, and validators that score agents the
                  way production would.
                </p>
              </div>
            </CardShell>
          </RevealItem>

          {/* CLI card — graphic on top */}
          <RevealItem>
            <CardShell reduced={reduced} className="p-4 sm:p-5">
              <CliGraphic />
              <div className="px-2 pb-3 pt-6 sm:px-3">
                <div className="mb-4 flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-accent-soft">
                  <Cable className="size-4" aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-snow">
                  CLI Bridge
                </h3>
                <p className="mt-2 text-sm leading-6 text-mute">
                  Device-code login connects your terminal once. Every subsequent run syncs logs and
                  scores.
                </p>
              </div>
            </CardShell>
          </RevealItem>

          {/* Wide launch / scorecard timeline */}
          <RevealItem className="lg:col-span-2">
            <CardShell
              reduced={reduced}
              className="grid gap-8 p-4 sm:p-5 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-10 lg:p-6"
            >
              <ExplorerGraphic />
              <div className="px-2 pb-3 lg:px-2 lg:pb-0">
                <div className="mb-4 flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-accent-soft">
                  <Rocket className="size-4" aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-snow sm:text-2xl">
                  Scorecards That Stick
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-mute">
                  Nine dimensions — success, accuracy, planning, efficiency, verification, recovery,
                  memory, safety, overall — ready when you ship.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Success", "Accuracy", "Efficiency", "Safety", "Overall"].map((dim) => (
                    <span
                      key={dim}
                      className="inline-flex items-center gap-1.5 rounded-md border border-accent/25 bg-accent/[0.1] px-2.5 py-1 text-[11px] font-medium text-accent-soft"
                    >
                      <ShieldCheck className="size-3" aria-hidden="true" />
                      {dim}
                    </span>
                  ))}
                </div>
              </div>
            </CardShell>
          </RevealItem>
        </RevealStagger>
      </div>
    </section>
  );
}
