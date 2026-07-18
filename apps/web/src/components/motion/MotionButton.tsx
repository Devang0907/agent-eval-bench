"use client";

import { motion, useReducedMotion } from "motion/react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Hover/tap scale without breaking Button asChild — wrap the whole control.
 */
export function MotionButton({
  className,
  children,
  ...props
}: ButtonProps & { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const full = typeof className === "string" && className.includes("w-full");

  return (
    <motion.div
      className={cn("inline-flex", full && "w-full")}
      whileHover={reduced ? undefined : { scale: 1.03 }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
    >
      <Button className={cn(full && "w-full", className)} {...props}>
        {children}
      </Button>
    </motion.div>
  );
}
