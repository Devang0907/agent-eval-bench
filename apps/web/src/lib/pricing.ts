export type PricingTier = {
  id: string;
  name: string;
  price: string;
  period?: string;
  blurb: string;
  cta: { label: string; href: string };
  popular?: boolean;
  comingSoon?: boolean;
  features: string[];
  footnote?: string;
};

/** Free / Pro / Team — Pro is waitlist until billing ships. */
export const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/month",
    blurb: "Perfect for exploring the platform",
    cta: { label: "Get Started", href: "/signup" },
    features: [
      "Unlimited local runs",
      "Official benchmark suites",
      "Cloud sync for your account",
      "Device-code CLI login",
      "Personal leaderboard",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/month",
    blurb: "For builders shipping real eval pipelines",
    cta: { label: "Join Waitlist", href: "/signup" },
    popular: true,
    comingSoon: true,
    features: [
      "Everything in Free, plus:",
      "Unlimited synced projects",
      "Advanced scorecard analytics",
      "Shared team workspaces",
      "Priority sync & retention",
      "Priority support",
    ],
    footnote: "Coming soon — join the waitlist today.",
  },
  {
    id: "team",
    name: "Team",
    price: "Custom",
    blurb: "For startups and agent platforms",
    cta: { label: "Contact Sales", href: "mailto:hello@agentevalbench.dev" },
    features: [
      "Everything in Pro, plus:",
      "Role-based access & SSO",
      "Dedicated account support",
      "Custom benchmark suites",
      "API access & integrations",
      "SLA & compliance options",
    ],
  },
];
