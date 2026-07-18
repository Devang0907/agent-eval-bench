"use client";

import { useReducedMotion } from "motion/react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

const marks = [
  { name: "CLI", glyph: ">_" },
  { name: "Docker", glyph: "⬡" },
  { name: "Bun", glyph: "⚡" },
  { name: "GitHub", glyph: "⌥" },
  { name: "YAML", glyph: "☰" },
  { name: "Telemetry", glyph: "◉" },
  { name: "Sandbox", glyph: "▣" },
  { name: "Scorecard", glyph: "◆" },
];

function Mark({ name, glyph }: { name: string; glyph: string }) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-2.5 text-fog/55"
      translate="no"
    >
      <span
        className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] font-mono text-xs text-fog/70"
        aria-hidden="true"
      >
        {glyph}
      </span>
      <span className="font-display text-sm font-semibold tracking-wide">{name}</span>
    </span>
  );
}

export function TrustedStrip() {
  const reduced = useReducedMotion();
  const loop = [...marks, ...marks];

  return (
    <section className="relative overflow-hidden border-y border-white/[0.06] bg-ink py-16">
      <div className="container-wide relative z-10 text-center">
        <Reveal>
          <p className="text-sm text-mute">Trusted by developers and product teams worldwide</p>
          <p className="mt-2 text-xs text-mute/70">
            Built around the tools agent teams already ship with
          </p>
        </Reveal>
      </div>

      <div
        className={cn(
          "mt-10",
          reduced ? "container-wide flex flex-wrap justify-center gap-x-10 gap-y-5" : "relative",
        )}
      >
        {reduced ? (
          marks.map((m) => <Mark key={m.name} {...m} />)
        ) : (
          <div className="mask-[linear-gradient(90deg,transparent,black_8%,black_92%,transparent)] [-webkit-mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
            <div className="marquee-track px-8">
              {loop.map((m, i) => (
                <Mark key={`${m.name}-${i}`} {...m} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
