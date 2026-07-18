"use client";

import { useReducedMotion } from "motion/react";
import type { FC } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

type AgentMark = {
  name: string;
  Logo: FC<{ className?: string }>;
};

function CodexLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A5.985 5.985 0 0 0 10.958.5 6.035 6.035 0 0 0 5.532 3.34a5.986 5.986 0 0 0-3.997 2.9 6.046 6.046 0 0 0 .743 7.097 5.985 5.985 0 0 0 .517 4.91 6.048 6.048 0 0 0 6.51 2.9A5.984 5.984 0 0 0 13.042 23.5a6.033 6.033 0 0 0 5.425-2.84 5.986 5.986 0 0 0 3.997-2.9 6.048 6.048 0 0 0-.742-7.039ZM13.042 22.043a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.759a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.495ZM3.55 18.35a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.373v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.492 4.492 0 0 1-6.19-1.6ZM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872Zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.69Zm2.01-3.023-.141-.085-4.78-2.742a.776.776 0 0 0-.785 0L9.409 9.243V6.911a.066.066 0 0 1 .028-.061l4.83-2.787a4.494 4.494 0 0 1 6.68 4.66ZM8.307 12.683l-2.02-1.163a.08.08 0 0 1-.038-.057V5.875a4.494 4.494 0 0 1 7.375-3.453l-.142.08L8.69 5.26a.795.795 0 0 0-.393.681zm1.097-2.365L12 8.725l2.597 1.498v2.99L12 14.713l-2.597-1.499z" />
    </svg>
  );
}

function ClaudeLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.5 2.5c.4 2.8 1.4 4.6 3.2 6.4 1.8 1.8 3.6 2.8 6.4 3.2-2.8.4-4.6 1.4-6.4 3.2-1.8 1.8-2.8 3.6-3.2 6.4-.4-2.8-1.4-4.6-3.2-6.4C7.5 13.5 5.7 12.5 2.9 12.1c2.8-.4 4.6-1.4 6.4-3.2 1.8-1.8 2.8-3.6 3.2-6.4Z" />
    </svg>
  );
}

function PiLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 7.5h14M9.5 7.5v9.2c0 1.4-.9 2.3-2.3 2.3M14.5 7.5v11"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OpenCodeLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M8.5 7.5 4 12l4.5 4.5M15.5 7.5 20 12l-4.5 4.5M13.2 5.5l-2.4 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AgentDevLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7L12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M12 7.5v9M8.5 9.75l7 4.5M15.5 9.75l-7 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CursorLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4 3.5 19.5 12 12.2 13.6 9.8 20.5 4 3.5Z" />
    </svg>
  );
}

function AiderLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 4 5 20h3.2l1.4-3.6h4.8L15.8 20H19L12 4Zm0 5.2 1.7 4.4h-3.4L12 9.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

const agents: AgentMark[] = [
  { name: "Codex", Logo: CodexLogo },
  { name: "Claude Code", Logo: ClaudeLogo },
  { name: "Pi", Logo: PiLogo },
  { name: "OpenCode", Logo: OpenCodeLogo },
  { name: "Agent Dev", Logo: AgentDevLogo },
  { name: "Cursor", Logo: CursorLogo },
  { name: "Aider", Logo: AiderLogo },
];

function Mark({ name, Logo }: AgentMark) {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-3 text-white/45 transition-colors duration-300 hover:text-white/80"
      translate="no"
    >
      <span
        className="flex size-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] grayscale"
        aria-hidden="true"
      >
        <Logo className="size-5" />
      </span>
      <span className="text-sm font-semibold tracking-wide">{name}</span>
    </span>
  );
}

export function TrustedStrip() {
  const reduced = useReducedMotion();
  const loop = [...agents, ...agents];

  return (
    <section className="relative overflow-hidden border-y border-white/[0.08] py-14 sm:py-16">
      <div className="container-wide relative z-10 text-center">
        <Reveal>
          <p className="text-pretty text-base text-mute sm:text-lg">
            Evaluate{" "}
            <span className="font-medium text-fog">Codex</span>,{" "}
            <span className="font-medium text-fog">Claude Code</span>,{" "}
            <span className="font-medium text-fog">Pi</span>,{" "}
            <span className="font-medium text-fog">OpenCode</span>,{" "}
            <span className="font-medium text-fog">Agent Dev</span>, and other coding agents —
            with adapters built for each.
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
          agents.map((m) => <Mark key={m.name} {...m} />)
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
