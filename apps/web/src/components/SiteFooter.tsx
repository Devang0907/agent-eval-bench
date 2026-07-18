import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

const productLinks = [
  { href: "/#product", label: "Features" },
  { href: "/#how-it-works", label: "How it Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Documentation" },
];

const resourceLinks = [
  { href: "/docs", label: "Getting Started" },
  { href: "/docs/cloud", label: "Cloud Sync" },
  { href: "/device", label: "Link CLI" },
  { href: "/dashboard", label: "Dashboard" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line/70">
      <div className="container-wide grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <BrandMark />
          <p className="mt-3 max-w-sm text-sm leading-6 text-mute">
            Measure coding agents like production software. Sandboxed benchmarks, scorecards, and
            cloud visibility for every run.
          </p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-panel/60 px-3 py-1.5 text-xs text-fog">
            <span className="size-1.5 rounded-full bg-good" aria-hidden="true" />
            All systems operational
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-mute">Product</p>
          <ul className="mt-4 space-y-2.5 text-sm text-fog">
            {productLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-snow">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-mute">Resources</p>
          <ul className="mt-4 space-y-2.5 text-sm text-fog">
            {resourceLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-snow">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-wide flex flex-col gap-3 border-t border-line/60 py-6 text-xs text-mute sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Agent Eval Bench. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/docs" className="hover:text-snow">
            Docs
          </Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-snow">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
