import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <div className="container-page py-16">
      <h1 className="animate-rise font-display text-4xl font-semibold tracking-tight text-snow">
        Pricing
      </h1>
      <p className="animate-rise delay-1 mt-3 max-w-xl text-mute">
        The open-source CLI is free. Cloud sync for personal dashboards is included while we build
        the platform.
      </p>
      <div className="animate-rise delay-2 mt-12 max-w-md border-t border-line pt-6">
        <p className="font-display text-xl font-medium text-snow">Free</p>
        <p className="mt-2 text-sm text-mute">
          Unlimited local runs, official benchmark suites, and cloud sync for your account.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-fog">
          <li>CLI + Docker/local sandboxes</li>
          <li>Synced runs, logs, and leaderboards</li>
          <li>Device-code login from the terminal</li>
        </ul>
        <Link
          href="/signup"
          className="focus-ring mt-8 inline-flex rounded-full bg-snow px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-white"
        >
          Get started
        </Link>
      </div>
    </div>
  );
}
