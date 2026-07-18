"use client";

import { motion, useReducedMotion } from "motion/react";
import { Reveal, RevealItem, RevealStagger } from "@/components/motion/Reveal";

const steps = [
  {
    step: "01",
    title: "Describe & init",
    body: "Install the CLI, scaffold a suite, and point it at your agent adapter.",
  },
  {
    step: "02",
    title: "Run locally",
    body: "Execute sandboxed benchmarks offline. Scorecards land on disk before anything syncs.",
  },
  {
    step: "03",
    title: "Sync & share",
    body: "Device-login once, then push runs, telemetry, and leaderboards to your dashboard.",
  },
];

export function HowItWorks() {
  const reduced = useReducedMotion();

  return (
    <section id="how-it-works" className="scroll-mt-20 py-28">
      <div className="container-wide">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="section-badge">How it Works</span>
          <h2 className="mt-5 text-balance font-display text-3xl font-semibold tracking-[-0.03em] text-snow sm:text-5xl">
            From local eval to cloud visibility in minutes
          </h2>
          <p className="mt-4 text-pretty text-sm text-mute sm:text-base">
            A short loop you already know from modern developer tools — init, run, link, inspect.
          </p>
        </Reveal>

        <div className="relative mt-16">
          {/* Connector through badge centers (badge center ≈ card pad 32px + half of 48px) */}
          <div
            className="pointer-events-none absolute left-[16.5%] right-[16.5%] top-[3.5rem] z-0 hidden h-px md:block"
            aria-hidden="true"
          >
            <div className="h-full w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/35 to-transparent blur-[1px]" />
          </div>

          <RevealStagger className="relative z-[1] grid gap-4 md:grid-cols-3" fast>
            {steps.map((item) => (
              <RevealItem key={item.step}>
                <motion.article
                  className="group relative h-full overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#0c0e12] p-7 sm:p-8"
                  whileHover={reduced ? undefined : { y: -3 }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                >
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent"
                    aria-hidden="true"
                  />

                  <div className="relative mb-6 flex size-12 items-center justify-center rounded-full border border-accent/35 bg-[#0c0e12] shadow-[0_0_0_1px_rgba(80,180,255,0.08),0_0_28px_-4px_rgba(80,180,255,0.55)]">
                    <span className="font-mono text-[13px] font-medium tracking-wide text-accent-soft">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-snow">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-6 text-mute">{item.body}</p>
                </motion.article>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </div>
    </section>
  );
}
