"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { HeroBackdrop, HeroCurve } from "@/components/marketing/HeroBackdrop";
import { ProductPreview } from "@/components/marketing/ProductPreview";
import { MotionButton } from "@/components/motion/MotionButton";
import { motionSafe } from "@/lib/motion";

export function Hero() {
  const reduced = useReducedMotion();
  const m = motionSafe(reduced);

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden pb-16 -mt-14 pt-24 sm:pb-20 sm:pt-28">
      <HeroBackdrop />

      <motion.div
        className="container-wide relative z-10 text-center"
        initial="hidden"
        animate="show"
        variants={m.stagger}
      >
        <motion.h1
          className="mx-auto max-w-4xl text-balance font-display text-[2.125rem] font-semibold leading-[1.08] tracking-[-0.035em] text-snow sm:text-5xl sm:leading-[1.06] md:text-6xl lg:text-[3.75rem] lg:leading-[1.05]"
          variants={m.fadeUp}
        >
          Measure coding agents like production software
        </motion.h1>
        <motion.p
          className="mx-auto mt-6 max-w-xl text-pretty font-sans text-sm font-normal leading-7 tracking-[-0.01em] text-mute sm:mt-7 sm:max-w-2xl sm:text-[15px] sm:leading-8"
          variants={m.fadeUp}
        >
          Sandboxed benchmarks, nine-dimension scorecards, and a cloud dashboard for every run —
          from local CLI to shared leaderboards in minutes.
        </motion.p>
        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-10 sm:gap-4"
          variants={m.fadeUp}
        >
          <MotionButton
            asChild
            size="default"
            className="h-10 px-5 text-[13px] font-medium tracking-[-0.01em]"
          >
            <Link href="/signup">Start Building Free</Link>
          </MotionButton>
          <MotionButton
            asChild
            size="default"
            variant="secondary"
            className="h-10 px-5 text-[13px] font-medium tracking-[-0.01em]"
          >
            <Link href="/docs">
              <Play aria-hidden="true" className="size-3 fill-current" />
              Watch Demo
            </Link>
          </MotionButton>
        </motion.div>
      </motion.div>

      <div className="hero-product relative z-10 mt-14 sm:mt-16">
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
