"use client";

import { Reveal, RevealItem, RevealStagger } from "@/components/motion/Reveal";

const steps = [
  {
    step: "01",
    title: "Describe & init",
    body: "Install the CLI, scaffold a suite, and point it at your agent adapter.",
    preview: [
      { tone: "mute", text: "$ npm i -g agent-eval-bench" },
      { tone: "mute", text: "$ agent-eval-bench init recovery" },
      { tone: "accent", text: "✓ suite ready · adapter: mock-local" },
    ],
  },
  {
    step: "02",
    title: "Run locally",
    body: "Execute sandboxed benchmarks offline. Scorecards land on disk before anything syncs.",
    preview: [
      { tone: "mute", text: "$ agent-eval-bench run --suite recovery" },
      { tone: "fog", text: "validators · planning · recovery" },
      { tone: "accent", text: "✓ scorecard 86.4 written to disk" },
    ],
  },
  {
    step: "03",
    title: "Sync & share",
    body: "Device-login once, then push runs, telemetry, and leaderboards to your dashboard.",
    preview: [
      { tone: "mute", text: "$ agent-eval-bench login" },
      { tone: "mute", text: "$ agent-eval-bench sync" },
      { tone: "accent", text: "✓ 24 runs live on dashboard" },
    ],
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-28 sm:py-32">
      <div className="container-wide">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)] lg:gap-20">
          <Reveal className="max-w-md lg:sticky lg:top-28 lg:self-start">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
              How it works
            </p>
            <h2 className="mt-4 text-balance font-display text-3xl font-semibold tracking-[-0.035em] text-snow sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              From local eval to cloud visibility in minutes
            </h2>
            <p className="mt-5 text-pretty text-sm leading-7 text-white/40">
              A short loop you already know from modern developer tools — init, run, link, inspect.
            </p>
          </Reveal>

          <RevealStagger className="relative" fast>
            {/* Vertical spine */}
            <div
              className="pointer-events-none absolute bottom-6 left-[1.125rem] top-6 hidden w-px bg-gradient-to-b from-white/10 via-white/15 to-transparent sm:block"
              aria-hidden="true"
            />

            <ol className="relative space-y-0">
              {steps.map((item, index) => (
                <RevealItem key={item.step}>
                  <li className="relative grid gap-5 py-8 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-8 sm:py-10">
                    {index < steps.length - 1 ? (
                      <div
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-white/10 via-white/[0.06] to-transparent"
                        aria-hidden="true"
                      />
                    ) : null}

                    <div className="relative flex items-start sm:justify-center">
                      <span className="relative z-[1] flex size-9 items-center justify-center rounded-full border border-white/10 bg-black font-mono text-[11px] font-medium text-white/55 sm:size-9">
                        {item.step}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
                        <div className="max-w-sm">
                          <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-snow sm:text-xl">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-white/40">{item.body}</p>
                        </div>

                        <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/[0.07] bg-[#07090d]">
                          <div className="flex items-center gap-1.5 border-b border-white/[0.05] px-3 py-2">
                            <span className="size-1.5 rounded-full bg-white/15" />
                            <span className="size-1.5 rounded-full bg-white/15" />
                            <span className="size-1.5 rounded-full bg-white/15" />
                            <span className="ml-2 font-mono text-[10px] text-white/25">
                              terminal
                            </span>
                          </div>
                          <div className="space-y-1.5 px-3.5 py-3 font-mono text-[11px] leading-5 sm:text-[12px]">
                            {item.preview.map((line) => (
                              <p
                                key={line.text}
                                className={
                                  line.tone === "accent"
                                    ? "text-accent-soft/90"
                                    : line.tone === "fog"
                                      ? "text-white/45"
                                      : "text-white/30"
                                }
                              >
                                {line.text}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </RevealItem>
              ))}
            </ol>
          </RevealStagger>
        </div>
      </div>
    </section>
  );
}
