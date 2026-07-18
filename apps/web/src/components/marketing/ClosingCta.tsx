import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ClosingCta() {
  return (
    <section className="pb-24 pt-8">
      <div className="container-wide">
        <div className="relative overflow-hidden rounded-[2rem] border border-line bg-ink-soft px-6 py-16 text-center sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 glow-horizon opacity-80" />
          <div className="relative z-10">
            <h2 className="mx-auto max-w-2xl text-balance font-display text-3xl font-semibold tracking-tight text-snow sm:text-5xl">
              Ship your next eval with confidence
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-mute">
              Describe the suite, run it locally, and launch results to a shared dashboard —
              instantly.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/signup">Start Building Free</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/docs">Watch the Docs</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
