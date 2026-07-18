import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

const productLinks = [
  { href: "/#product", label: "Features" },
  { href: "/#how-it-works", label: "How it Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Documentation" },
  { href: "/dashboard", label: "Dashboard" },
];

const companyLinks = [
  { href: "/docs", label: "About" },
  { href: "mailto:hello@agentevalbench.dev", label: "Contact" },
  { href: "https://github.com", label: "GitHub", external: true },
  { href: "/docs", label: "Changelog" },
];

const resourceLinks = [
  { href: "/docs", label: "Getting Started" },
  { href: "/docs/cloud", label: "Cloud Sync" },
  { href: "/device", label: "Link CLI" },
  { href: "/docs/cli", label: "CLI Reference" },
];

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-white/[0.06]">
      <div className="container-wide grid gap-12 py-16 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <BrandMark />
          <p className="mt-4 max-w-sm text-sm leading-6 text-mute">
            Build measurable agents from a simple suite. Designed for founders, researchers, and
            modern agent teams.
          </p>
          <div className="mt-6 flex gap-2">
            {["X", "GH", "in"].map((label) => (
              <a
                key={label}
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="focus-ring flex size-9 items-center justify-center rounded-lg border border-white/10 bg-panel/50 text-[11px] font-medium text-mute hover:text-snow"
                aria-label={label === "GH" ? "GitHub" : label}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-mute">Product</p>
          <ul className="mt-4 space-y-2.5 text-sm text-fog">
            {productLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="hover:text-snow">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-mute">Company</p>
          <ul className="mt-4 space-y-2.5 text-sm text-fog">
            {companyLinks.map((link) => (
              <li key={link.label}>
                {"external" in link && link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-snow"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link href={link.href} className="hover:text-snow">
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-mute">Resources</p>
          <ul className="mt-4 space-y-2.5 text-sm text-fog">
            {resourceLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="hover:text-snow">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-wide flex flex-col gap-4 border-t border-white/[0.06] py-6 text-xs text-mute sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Agent Eval Bench. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/docs" className="hover:text-snow">
            Privacy Policy
          </Link>
          <Link href="/docs" className="hover:text-snow">
            Terms of Service
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-panel/50 px-3 py-1 text-fog">
            <span className="size-1.5 rounded-full bg-good" aria-hidden="true" />
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}
