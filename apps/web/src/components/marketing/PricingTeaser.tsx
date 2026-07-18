import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const perks = [
  "Unlimited local runs",
  "Official benchmark suites",
  "Cloud sync for your account",
  "Device-code CLI login",
];

export function PricingTeaser() {
  return (
    <section className="py-24">
      <div className="container-wide">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-badge">Pricing</span>
          <h2 className="mt-5 text-balance font-display text-3xl font-semibold tracking-tight text-snow sm:text-4xl">
            Simple pricing for every builder
          </h2>
          <p className="mt-4 text-pretty text-mute">
            The open-source CLI is free. Cloud sync for personal dashboards is included while we
            build the platform.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-md rounded-3xl border border-line bg-panel/60 p-8">
          <p className="text-sm font-medium text-fog">Free</p>
          <p className="mt-2 font-display text-5xl font-semibold text-snow">
            $0<span className="text-base font-normal text-mute">/month</span>
          </p>
          <p className="mt-3 text-sm text-mute">Perfect for exploring the platform</p>
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
          <p className="mt-4 text-center text-xs text-mute">
            Need details?{" "}
            <Link href="/pricing" className="text-accent-soft hover:text-snow">
              View pricing
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
