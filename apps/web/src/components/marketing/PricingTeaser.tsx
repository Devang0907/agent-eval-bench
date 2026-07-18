"use client";

import { PricingCards } from "@/components/marketing/PricingCards";
import { Reveal } from "@/components/motion/Reveal";

export function PricingTeaser() {
  return (
    <section className="py-28">
      <div className="container-wide">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="section-badge">Pricing</span>
          <h2 className="mt-5 text-balance font-display text-3xl font-semibold tracking-[-0.03em] text-snow sm:text-5xl">
            Simple pricing for every builder
          </h2>
          <p className="mt-4 text-pretty text-mute">
            The open-source CLI is free. Cloud sync for personal dashboards is included while we
            build the platform — Pro and Team land next.
          </p>
        </Reveal>

        <Reveal className="mt-14">
          <PricingCards />
        </Reveal>
      </div>
    </section>
  );
}
