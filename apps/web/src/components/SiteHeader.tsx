"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { MotionButton } from "@/components/motion/MotionButton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { easeOutExpo } from "@/lib/motion";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.09.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.56 9.56 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10Z" />
    </svg>
  );
}

const links = [
  { href: "/#product", label: "Product" },
  { href: "/#how-it-works", label: "How it Works" },
  { href: "/#faq", label: "FAQ" },
  { href: "/docs", label: "Docs" },
];

export function SiteHeader() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const t = reduced
    ? { duration: 0 }
    : { duration: 0.5, ease: easeOutExpo };

  return (
    <motion.header
      className="site-header sticky top-0 z-40 flex justify-center px-3 sm:px-4"
      animate={{ paddingTop: scrolled ? 12 : 0, paddingBottom: scrolled ? 4 : 0 }}
      transition={t}
    >
      <motion.div
        className={cn(
          "site-header-shell relative flex h-14 w-full items-center justify-between gap-3",
          scrolled ? "border border-white/10 backdrop-blur-xl" : "border border-transparent",
        )}
        animate={{
          maxWidth: scrolled ? 1024 : 1280,
          borderRadius: scrolled ? 9999 : 0,
          paddingLeft: scrolled ? 20 : 32,
          paddingRight: scrolled ? 20 : 32,
          backgroundColor: scrolled ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0)",
          boxShadow: scrolled
            ? "0 12px 40px -12px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.08)"
            : "0 0 0 0 rgba(0,0,0,0)",
        }}
        transition={t}
      >
        <Link href="/" className="focus-ring shrink-0 rounded-lg">
          <BrandMark
            className={cn(scrolled && "gap-1.5 [&_span]:text-[13px] sm:[&_span]:text-[15px]")}
          />
        </Link>

        <nav
          aria-label="Primary"
          className={cn(
            "absolute left-1/2 hidden -translate-x-1/2 items-center text-[13px] text-mute lg:flex",
            scrolled ? "gap-5" : "gap-8",
          )}
        >
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-snow">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open menu"
              >
                <Menu aria-hidden="true" className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 overscroll-contain">
              {links.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link href={link.href}>{link.label}</Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem asChild>
                <a href="https://github.com" target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </DropdownMenuItem>
              {!session?.user ? (
                <DropdownMenuItem asChild>
                  <Link href="/login">Log in</Link>
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="focus-ring hidden items-center gap-1.5 rounded-full px-2 py-1 text-sm text-fog hover:text-snow sm:inline-flex"
          >
            <GitHubIcon className="size-4" />
            GitHub
          </a>
          {session?.user ? (
            <MotionButton asChild size="sm">
              <Link href="/dashboard">Open Dashboard</Link>
            </MotionButton>
          ) : (
            <>
              <Link
                href="/login"
                className="focus-ring hidden rounded-full px-2 py-1 text-sm text-mute hover:text-snow sm:inline"
              >
                Log in
              </Link>
              <MotionButton asChild size="sm" variant="secondary">
                <Link href="/signup">Sign Up</Link>
              </MotionButton>
            </>
          )}
        </div>
      </motion.div>
    </motion.header>
  );
}
