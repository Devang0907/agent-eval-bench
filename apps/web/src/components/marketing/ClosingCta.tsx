"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { MotionButton } from "@/components/motion/MotionButton";
import { Reveal } from "@/components/motion/Reveal";
import { motionSafe } from "@/lib/motion";

export function ClosingCta() {
  const reduced = useReducedMotion();
  const m = motionSafe(reduced);

  return (
    <section className="pb-8 pt-8">
      <div className="relative overflow-hidden border-y border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0 bg-[#05070a]" aria-hidden="true" />
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 h-[55%]"
          aria-hidden="true"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={m.fadeIn}
        >
          <div className="hero-horizon-bloom !inset-auto !left-[-10%] !right-[-10%] !top-0 !h-full opacity-90" />
          <div className="hero-horizon-arc !bottom-auto !top-[35%] h-48 opacity-80" />
        </motion.div>
        <div className="hero-grain pointer-events-none absolute inset-0 opacity-25" aria-hidden="true" />

        <Reveal className="container-wide relative z-10 px-6 py-24 text-center sm:py-28">
          <h2 className="mx-auto max-w-3xl text-balance font-display text-3xl font-semibold tracking-[-0.035em] text-snow sm:text-5xl md:text-6xl">
            Turn your next idea into a measured agent
          </h2>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <MotionButton asChild size="lg">
              <Link href="/signup">Start Building Free</Link>
            </MotionButton>
            <MotionButton asChild size="lg" variant="secondary">
              <Link href="/docs">
                <Play aria-hidden="true" className="size-3.5 fill-current" />
                Watch Demo
              </Link>
            </MotionButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
