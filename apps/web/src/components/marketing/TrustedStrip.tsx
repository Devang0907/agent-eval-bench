"use client";

import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";

type AgentMark = {
  name: string;
  src: string;
};

/** Ranking table agents + existing Pi / Agent Dev */
const agents: AgentMark[] = [
  { name: "Codex CLI", src: "/logos/codex.svg" },
  { name: "Claude Code", src: "/logos/claude-code.svg" },
  { name: "Gemini CLI", src: "/logos/gemini.svg" },
  { name: "Cursor", src: "/logos/cursor.svg" },
  { name: "GitHub Copilot", src: "/logos/github-copilot.svg" },
  { name: "Windsurf", src: "/logos/windsurf.svg" },
  { name: "OpenCode", src: "/logos/opencode-logo.svg" },
  { name: "Cline", src: "/logos/cline.svg" },
  { name: "Aider", src: "/logos/aider.svg" },
  { name: "Crush", src: "/logos/crush.svg" },
  { name: "Pi", src: "/logos/pi.svg" },
  { name: "Agent Dev", src: "/logos/agent-dev.png" },
];

function Mark({ name, src }: AgentMark) {
  return (
    <span className="inline-flex shrink-0 items-center gap-3 text-white/45" translate="no">
      <span
        className="flex size-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03]"
        aria-hidden="true"
      >
        <Image
          src={src}
          alt=""
          width={22}
          height={22}
          className="size-[22px] object-contain opacity-70 brightness-0 invert"
        />
      </span>
      <span className="text-sm font-semibold tracking-wide">{name}</span>
    </span>
  );
}

function MarqueeRow({ items }: { items: AgentMark[] }) {
  return (
    <div className="flex shrink-0 items-center gap-14 px-7" aria-hidden="true">
      {items.map((m, i) => (
        <Mark key={`${m.name}-${i}`} {...m} />
      ))}
    </div>
  );
}

export function TrustedStrip() {
  const sequence = [...agents, ...agents, ...agents];

  return (
    <section className="relative overflow-hidden border-y border-white/[0.08] py-14 sm:py-16">
      <div className="container-wide relative z-10 text-center">
        <Reveal>
          <p className="text-pretty text-base text-mute sm:text-lg">
            Evaluate{" "}
            <span className="font-medium text-fog">Codex</span>,{" "}
            <span className="font-medium text-fog">Claude Code</span>,{" "}
            <span className="font-medium text-fog">Gemini</span>,{" "}
            <span className="font-medium text-fog">Cursor</span>,{" "}
            <span className="font-medium text-fog">Copilot</span>,{" "}
            <span className="font-medium text-fog">OpenCode</span>,{" "}
            <span className="font-medium text-fog">Agent Dev</span>, and other coding agents —
            with adapters built for each.
          </p>
        </Reveal>
      </div>

      <div
        className="trusted-marquee relative mt-10 overflow-hidden"
        style={{
          maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="trusted-marquee-track flex w-max">
          <MarqueeRow items={sequence} />
          <MarqueeRow items={sequence} />
        </div>
      </div>
    </section>
  );
}
