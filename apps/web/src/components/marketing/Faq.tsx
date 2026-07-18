"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/motion/Reveal";

const faqs = [
  {
    q: "Can I start with the free plan?",
    a: "Yes. The CLI and personal cloud sync are free while we build the platform. Create an account, link a machine, and sync runs anytime.",
  },
  {
    q: "What happens if I only run locally?",
    a: "Local runs stay on your machine. Nothing leaves your environment until you log in and sync — the CLI remains offline-first.",
  },
  {
    q: "How does CLI device login work?",
    a: "Run agent-eval-bench login, open the approval URL, and enter the code shown in your terminal. That links the machine to your account.",
  },
  {
    q: "Can I upgrade or change plans later?",
    a: "Yes. When Pro and Team ship, you can upgrade from the dashboard. Your synced history stays attached to your account.",
  },
  {
    q: "Do you offer yearly billing?",
    a: "Not yet. Current access is free. Yearly options will appear when paid plans launch.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can stop syncing, revoke tokens, or delete API access from Settings whenever you want.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 py-28">
      <div className="container-wide grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <Reveal>
          <span className="section-badge">FAQs</span>
          <h2 className="mt-5 text-balance font-display text-3xl font-semibold tracking-[-0.03em] text-snow sm:text-5xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 max-w-md text-pretty text-mute">
            Straight answers about the free CLI, cloud sync, and how device login connects your
            terminal.
          </p>
        </Reveal>

        <Reveal>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((item, index) => (
              <AccordionItem
                key={item.q}
                value={`item-${index}`}
                className="rounded-3xl border-white/[0.08] bg-panel/55 px-6"
              >
                <AccordionTrigger className="py-5 text-[15px]">{item.q}</AccordionTrigger>
                <AccordionContent className="pb-5">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
