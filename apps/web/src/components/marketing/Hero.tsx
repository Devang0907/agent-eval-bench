"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { HeroBackdrop, HeroCurve } from "@/components/marketing/HeroBackdrop";
import { ProductPreview } from "@/components/marketing/ProductPreview";
import { MotionButton } from "@/components/motion/MotionButton";
import { motionSafe } from "@/lib/motion";

export function Hero() {
  const reduced = useReducedMotion();
  const m = motionSafe(reduced);

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden pb-12 -mt-14 pt-[4.5rem] sm:pt-20">
      <HeroBackdrop />

      <motion.div
        className="container-wide relative z-10 text-center"
        initial="hidden"
        animate="show"
        variants={m.stagger}
      >
        <motion.div variants={m.fadeUp}>
          <Badge className="border-white/10 bg-ink/40 font-sans backdrop-blur-md">
            Early access beta
          </Badge>
        </motion.div>
        <motion.h1
          className="mx-auto mt-8 max-w-5xl text-balance font-display text-[2.5rem] font-semibold tracking-[-0.04em] text-snow sm:text-6xl md:text-7xl lg:text-[4.75rem] lg:leading-[1.02]"
          variants={m.fadeUp}
        >
          Measure coding agents like production software
        </motion.h1>
        <motion.p
          className="mx-auto mt-6 max-w-2xl text-pretty font-sans text-base font-medium leading-7 tracking-[-0.01em] text-mute sm:text-lg sm:leading-8"
          variants={m.fadeUp}
        >
          Sandboxed benchmarks, nine-dimension scorecards, and a cloud dashboard for every run —
          from local CLI to shared leaderboards in minutes.
        </motion.p>
        <motion.div
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
          variants={m.fadeUp}
        >
          <MotionButton asChild size="lg" className="font-semibold tracking-[-0.01em]">
            <Link href="/signup">Start Building Free</Link>
          </MotionButton>
          <MotionButton
            asChild
            size="lg"
            variant="secondary"
            className="font-semibold tracking-[-0.01em]"
          >
            <Link href="/docs">
              <Play aria-hidden="true" className="size-3.5 fill-current" />
              Watch Demo
            </Link>
          </MotionButton>
        </motion.div>
      </motion.div>

      {/* Curve crest sits above dashboard; product frame occludes the lower arc */}
      <div className="hero-product relative z-10 mt-10 sm:mt-14">
        <HeroCurve />
        <motion.div
          className="relative z-[2] mx-auto w-full max-w-[88rem] px-3 sm:px-6 lg:px-8"
          initial="hidden"
          animate="show"
          variants={m.fadeUp}
          transition={{ delay: reduced ? 0 : 0.28 }}
        >
          <div className="product-frame-glow relative">
            <ProductPreview />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
