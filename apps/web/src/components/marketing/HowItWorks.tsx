"use client";

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
  return (
    <section id="how-it-works" className="scroll-mt-20 py-28">
      <div className="container-wide">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="section-badge">How it Works</span>
          <h2 className="mt-5 text-balance font-display text-3xl font-semibold tracking-[-0.03em] text-snow sm:text-5xl">
            From local eval to cloud visibility in minutes
          </h2>
          <p className="mt-4 text-pretty text-mute">
            A short loop you already know from modern developer tools — init, run, link, inspect.
          </p>
        </Reveal>

        <div className="relative mt-16">
          <div
            className="pointer-events-none absolute left-[16.5%] right-[16.5%] top-7 hidden h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent md:block"
            aria-hidden="true"
          />
          <RevealStagger className="grid gap-4 md:grid-cols-3" fast>
            {steps.map((item) => (
              <RevealItem key={item.step}>
                <div className="relative rounded-[1.75rem] border border-white/[0.08] bg-panel/40 p-6 sm:p-8">
                  <div className="relative z-10 mx-auto mb-5 flex size-14 items-center justify-center rounded-full border border-accent/30 bg-ink shadow-[0_0_28px_-6px_rgba(59,158,255,0.55)] md:mx-0">
                    <span className="font-mono text-sm font-medium text-accent-soft">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-snow">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-mute">{item.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </div>
    </section>
  );
}
