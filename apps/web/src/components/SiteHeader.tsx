"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";

const links = [
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Dashboard" },
];

export function SiteHeader() {
  const { data: session } = useSession();

  return (
    <header className="animate-fade sticky top-0 z-40 border-b border-line/60 bg-ink/70 backdrop-blur-xl">
      <div className="container-page flex h-14 items-center justify-between gap-4">
        <Link href="/" className="font-display text-[15px] font-semibold tracking-tight text-snow">
          Agent Eval Bench
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-mute sm:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-snow">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {session?.user ? (
            <Link
              href="/dashboard"
              className="focus-ring rounded-full bg-snow px-3.5 py-1.5 text-sm font-medium text-ink transition hover:bg-white"
            >
              Open dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden text-sm text-mute hover:text-snow sm:inline">
                Log in
              </Link>
              <Link
                href="/signup"
                className="focus-ring rounded-full bg-snow px-3.5 py-1.5 text-sm font-medium text-ink transition hover:bg-white"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
