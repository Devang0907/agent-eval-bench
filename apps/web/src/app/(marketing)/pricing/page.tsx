import type { Metadata } from "next";
import { PricingCards } from "@/components/marketing/PricingCards";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <div className="container-wide py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="section-badge">Pricing</span>
        <h1 className="mt-5 text-balance font-display text-4xl font-semibold tracking-[-0.03em] text-snow sm:text-5xl">
          Simple pricing for every builder
        </h1>
        <p className="mt-4 text-pretty text-mute">
          The open-source CLI is free. Cloud sync for personal dashboards is included while we build
          the platform.
        </p>
      </div>
      <div className="mt-14">
        <PricingCards />
      </div>
    </div>
  );
}
