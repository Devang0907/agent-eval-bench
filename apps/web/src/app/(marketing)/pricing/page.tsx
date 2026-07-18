import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Pricing" };

const perks = [
  "CLI + Docker/local sandboxes",
  "Synced runs, logs, and leaderboards",
  "Device-code login from the terminal",
  "Unlimited local benchmark runs",
];

export default function PricingPage() {
  return (
    <div className="container-wide py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <span className="section-badge">Pricing</span>
        <h1 className="animate-rise mt-5 text-balance font-display text-4xl font-semibold tracking-tight text-snow sm:text-5xl">
          Simple pricing for every builder
        </h1>
        <p className="animate-rise delay-1 mt-4 text-pretty text-mute">
          The open-source CLI is free. Cloud sync for personal dashboards is included while we build
          the platform.
        </p>
      </div>

      <div className="animate-rise delay-2 mx-auto mt-12 max-w-md rounded-3xl border border-accent/30 bg-panel/60 p-8 shadow-[0_0_60px_-20px_rgba(59,130,246,0.45)]">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-xl font-medium text-snow">Free</p>
          <span className="section-badge">Popular</span>
        </div>
        <p className="mt-4 font-display text-5xl font-semibold text-snow">
          $0<span className="text-base font-normal text-mute">/month</span>
        </p>
        <p className="mt-3 text-sm text-mute">
          Unlimited local runs, official benchmark suites, and cloud sync for your account.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-fog">
          {perks.map((perk) => (
            <li key={perk} className="flex items-start gap-2">
              <Check aria-hidden="true" className="mt-0.5 size-4 text-good" />
              <span>{perk}</span>
            </li>
          ))}
        </ul>
        <Button asChild className="mt-8 w-full">
          <Link href="/signup">Get Started</Link>
        </Button>
      </div>
    </div>
  );
}
