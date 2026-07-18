"use client";

import { motion, useReducedMotion } from "motion/react";
import { motionSafe, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const m = motionSafe(reduced);

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      variants={m.fadeUp}
    >
      {children}
    </motion.div>
  );
}

export function RevealStagger({
  children,
  className,
  fast = false,
}: {
  children: React.ReactNode;
  className?: string;
  fast?: boolean;
}) {
  const reduced = useReducedMotion();
  const m = motionSafe(reduced);

  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      variants={fast ? m.staggerFast : m.stagger}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const m = motionSafe(reduced);

  return (
    <motion.div className={cn(className)} variants={m.fadeUp}>
      {children}
    </motion.div>
  );
}
