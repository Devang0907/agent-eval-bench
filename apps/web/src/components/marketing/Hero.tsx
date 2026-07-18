import Link from "next/link";
import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeroBackdrop } from "@/components/marketing/HeroBackdrop";
import { ProductPreview } from "@/components/marketing/ProductPreview";

export function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden pb-10 pt-10 sm:pt-14">
      <HeroBackdrop />

      <div className="container-wide relative z-10 text-center">
        <Badge className="animate-rise border-white/10 bg-ink/40 font-sans backdrop-blur-md">
          Early access beta
        </Badge>
        <h1 className="animate-rise delay-1 mx-auto mt-7 max-w-4xl text-balance font-display text-4xl font-semibold tracking-[-0.035em] text-snow sm:text-5xl md:text-6xl lg:text-[4.5rem] lg:leading-[1.02]">
          Measure coding agents like production software
        </h1>
        <p className="animate-rise delay-2 mx-auto mt-5 max-w-2xl text-pretty font-sans text-[15px] font-medium leading-7 tracking-[-0.01em] text-mute sm:text-lg sm:leading-8">
          Sandboxed benchmarks, nine-dimension scorecards, and a cloud dashboard for every run —
          from local CLI to shared leaderboards in minutes.
        </p>
        <div className="animate-rise delay-2 mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="font-semibold tracking-[-0.01em]">
            <Link href="/signup">Start Building Free</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="font-semibold tracking-[-0.01em]">
            <Link href="/docs">
              <Play aria-hidden="true" className="size-3.5 fill-current" />
              Read the Docs
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative z-10 mt-16 sm:mt-24">
        {/* Half-circle sits behind the product frame */}
        <div
          className="pointer-events-none absolute inset-x-0 top-[18%] -z-10 h-[120%] sm:top-[22%]"
          aria-hidden="true"
        >
          <div className="hero-half-circle hero-half-circle--product">
            <div className="hero-half-circle-fill" />
            <div className="hero-half-circle-rim" />
            <div className="hero-half-circle-hot" />
          </div>
        </div>

        <div className="container-wide relative px-3 sm:px-8">
          <div className="product-frame-glow relative">
            <ProductPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
