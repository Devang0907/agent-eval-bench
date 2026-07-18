"use client";

import { useReducedMotion } from "motion/react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

const quotes = [
  {
    role: "Solo Developer",
    name: "Jordan M.",
    title: "Indie Developer",
    body: "I used to juggle notebooks, Docker scripts, and spreadsheets. Agent Eval Bench gives me one scorecard per run — and a dashboard when I need to share it.",
  },
  {
    role: "Startup Founder",
    name: "Rachel T.",
    title: "Founder",
    body: "We needed a repeatable way to compare coding agents before shipping. Local sandboxes plus cloud sync saved us weeks of ad-hoc tooling.",
  },
  {
    role: "Platform Engineer",
    name: "Michael L.",
    title: "Lead Engineer",
    body: "Device-code login from the CLI feels familiar. Our team can sync runs without wiring custom auth into every laptop.",
  },
  {
    role: "Research Engineer",
    name: "Sofia G.",
    title: "ML Engineer",
    body: "Nine-dimension scorecards made agent comparisons legible for the first time. The run explorer is where our reviews actually happen now.",
  },
];

function QuoteCard({
  role,
  name,
  title,
  body,
}: {
  role: string;
  name: string;
  title: string;
  body: string;
}) {
  return (
    <blockquote className="relative w-[min(360px,82vw)] shrink-0 overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-panel/55 p-6 sm:p-8">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/[0.05] to-transparent"
        aria-hidden="true"
      />
      <p className="section-badge relative">{role}</p>
      <p className="relative mt-5 text-pretty text-base leading-7 text-fog">
        &ldquo;{body}&rdquo;
      </p>
      <footer className="relative mt-6">
        <p className="text-sm font-medium text-snow" translate="no">
          {name}
        </p>
        <p className="text-xs text-mute">{title}</p>
      </footer>
    </blockquote>
  );
}

export function Testimonials() {
  const reduced = useReducedMotion();
  const loop = [...quotes, ...quotes];

  return (
    <section className="overflow-hidden py-28">
      <div className="container-wide">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="section-badge">Testimonials</span>
          <h2 className="mt-5 text-balance font-display text-3xl font-semibold tracking-[-0.03em] text-snow sm:text-5xl">
            From idea to production in minutes
          </h2>
          <p className="mt-4 text-pretty text-mute">
            Early builders use Agent Eval Bench to standardize how agents are measured across local
            machines and shared cloud history.
          </p>
        </Reveal>
      </div>

      <div className={cn("mt-14", reduced ? "container-wide" : "")}>
        {reduced ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quotes.map((q) => (
              <QuoteCard key={q.name} {...q} />
            ))}
          </div>
        ) : (
          <div className="mask-[linear-gradient(90deg,transparent,black_6%,black_94%,transparent)] [-webkit-mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
            <div className="marquee-track gap-4 px-4 hover:[animation-play-state:paused]">
              {loop.map((q, i) => (
                <QuoteCard key={`${q.name}-${i}`} {...q} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
