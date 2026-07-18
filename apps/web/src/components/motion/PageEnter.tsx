"use client";

import { motion, useReducedMotion } from "motion/react";
import { motionSafe } from "@/lib/motion";

export function PageEnter({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const m = motionSafe(reduced);

  return (
    <motion.div initial="hidden" animate="show" variants={m.fadeUp}>
      {children}
    </motion.div>
  );
}
