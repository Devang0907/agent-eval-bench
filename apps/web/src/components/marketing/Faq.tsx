"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    a: "Yes. When paid tiers ship, you can upgrade from the dashboard. Your synced history stays attached to your account.",
  },
  {
    q: "Do you offer yearly billing?",
    a: "Not yet. Current access is free. Yearly options will appear when Pro and Team plans launch.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can stop syncing, revoke tokens, or delete API access from Settings whenever you want.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 py-24">
      <div className="container-wide grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <span className="section-badge">FAQs</span>
          <h2 className="mt-5 text-balance font-display text-3xl font-semibold tracking-tight text-snow sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 max-w-md text-pretty text-mute">
            Straight answers about the free CLI, cloud sync, and how device login connects your
            terminal.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((item, index) => (
            <AccordionItem key={item.q} value={`item-${index}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
