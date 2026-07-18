import type { Transition, Variants } from "motion/react";

export const easeOutExpo: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const transitionSoft: Transition = {
  duration: 0.55,
  ease: easeOutExpo,
};

export const transitionQuick: Transition = {
  duration: 0.35,
  ease: easeOutExpo,
};

export const viewportOnce = {
  once: true,
  margin: "-10% 0px" as const,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: transitionSoft,
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: transitionSoft,
  },
};

export const stagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

export const staggerFast: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

/** Instant variants when reduced motion is preferred. */
export function motionSafe(reduced: boolean | null): {
  fadeUp: Variants;
  fadeIn: Variants;
  stagger: Variants;
  staggerFast: Variants;
  transition: Transition;
} {
  if (reduced) {
    const instant: Variants = {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: 0 } },
    };
    const noStagger: Variants = {
      hidden: {},
      show: { transition: { staggerChildren: 0, delayChildren: 0 } },
    };
    return {
      fadeUp: instant,
      fadeIn: instant,
      stagger: noStagger,
      staggerFast: noStagger,
      transition: { duration: 0 },
    };
  }
  return {
    fadeUp,
    fadeIn,
    stagger,
    staggerFast,
    transition: transitionSoft,
  };
}
