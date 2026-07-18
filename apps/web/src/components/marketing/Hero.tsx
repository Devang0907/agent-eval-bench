import Link from "next/link";
import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductPreview } from "@/components/marketing/ProductPreview";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-8 pt-16 sm:pt-20">
      <div className="container-wide relative z-10 text-center">
        <Badge className="animate-rise">Early access beta</Badge>
        <p
          className="animate-rise delay-1 mt-6 font-display text-5xl font-semibold tracking-tight text-snow sm:text-6xl md:text-7xl"
          translate="no"
        >
          Agent Eval Bench
        </p>
        <h1 className="animate-rise delay-1 mx-auto mt-5 max-w-3xl text-balance text-xl font-medium text-fog sm:text-2xl">
          Measure coding agents like production software
        </h1>
        <p className="animate-rise delay-2 mx-auto mt-4 max-w-2xl text-pretty text-base text-mute sm:text-lg">
          Sandboxed benchmarks, nine-dimension scorecards, and a cloud dashboard for every run —
          from local CLI to shared leaderboards in minutes.
        </p>
        <div className="animate-rise delay-2 mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/signup">Start Building Free</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/docs">
              <Play aria-hidden="true" className="size-3.5 fill-current" />
              Read the Docs
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative mt-16 sm:mt-20">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 glow-horizon sm:h-64" />
        <div className="container-wide relative z-10 px-3 sm:px-8">
          <ProductPreview />
        </div>
      </div>
    </section>
  );
}
