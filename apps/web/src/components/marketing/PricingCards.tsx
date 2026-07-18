"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { MotionButton } from "@/components/motion/MotionButton";
import { pricingTiers } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export function PricingCards({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-4 lg:grid-cols-3", className)}>
      {pricingTiers.map((tier) => (
        <article
          key={tier.id}
          className={cn(
            "relative flex flex-col rounded-[1.75rem] border p-7 sm:p-8",
            tier.popular
              ? "border-accent/40 bg-panel/70 shadow-[0_0_60px_-18px_rgba(59,158,255,0.55)]"
              : "border-white/[0.08] bg-panel/45",
          )}
        >
          {tier.popular ? (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-accent/40 bg-ink px-3 py-1 text-[11px] font-medium text-accent-soft">
              Popular
            </span>
          ) : null}
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-fog">{tier.name}</p>
            {tier.comingSoon ? (
              <span className="rounded-full border border-line bg-ink-soft px-2 py-0.5 text-[10px] uppercase tracking-wider text-mute">
                Soon
              </span>
            ) : null}
          </div>
          <p className="mt-3 font-display text-5xl font-semibold tracking-[-0.03em] text-snow">
            {tier.price}
            {tier.period ? (
              <span className="text-base font-normal text-mute">{tier.period}</span>
            ) : null}
          </p>
          <p className="mt-3 text-sm text-mute">{tier.blurb}</p>
          <ul className="mt-6 flex-1 space-y-3 text-sm text-fog">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-good" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <MotionButton
            asChild
            className="mt-8 w-full"
            variant={tier.popular ? "default" : "secondary"}
          >
            <Link href={tier.cta.href}>{tier.cta.label}</Link>
          </MotionButton>
          {tier.footnote ? (
            <p className="mt-3 text-center text-xs text-mute">{tier.footnote}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
