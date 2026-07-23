import type { Variants } from "framer-motion";

/** Shared admin list/filter reveal — soft fade, drift, and blur. */
export const ADMIN_FILTER_REVEAL_MOTION = {
  enterDurationSec: 0.44,
  exitDurationSec: 0.3,
  staggerSec: 0.045,
  maxStaggerItems: 10,
  offsetPx: 10,
  exitOffsetPx: 6,
  scaleFrom: 0.988,
  scaleExit: 0.992,
  blurPx: 3,
  blurExitPx: 2,
} as const;

export const ADMIN_FILTER_REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Staggered enter/exit variants for filtered admin list rows and cards.
 */
export function adminFilterRevealVariants(index: number, reducedMotion: boolean): Variants {
  if (reducedMotion) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
    };
  }

  const staggerDelay =
    Math.min(index, ADMIN_FILTER_REVEAL_MOTION.maxStaggerItems) *
    ADMIN_FILTER_REVEAL_MOTION.staggerSec;

  return {
    initial: {
      opacity: 0,
      y: ADMIN_FILTER_REVEAL_MOTION.offsetPx,
      scale: ADMIN_FILTER_REVEAL_MOTION.scaleFrom,
      filter: `blur(${ADMIN_FILTER_REVEAL_MOTION.blurPx}px)`,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: ADMIN_FILTER_REVEAL_MOTION.enterDurationSec,
        delay: staggerDelay,
        ease: ADMIN_FILTER_REVEAL_EASE,
      },
    },
    exit: {
      opacity: 0,
      y: ADMIN_FILTER_REVEAL_MOTION.exitOffsetPx,
      scale: ADMIN_FILTER_REVEAL_MOTION.scaleExit,
      filter: `blur(${ADMIN_FILTER_REVEAL_MOTION.blurExitPx}px)`,
      transition: {
        duration: ADMIN_FILTER_REVEAL_MOTION.exitDurationSec,
        ease: ADMIN_FILTER_REVEAL_EASE,
      },
    },
  };
}

/** Empty-state panel — slightly slower, no stagger. */
export function adminFilterEmptyStateVariants(reducedMotion: boolean): Variants {
  if (reducedMotion) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
    };
  }

  return {
    initial: {
      opacity: 0,
      y: 14,
      scale: 0.99,
      filter: "blur(4px)",
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: 0.48,
        ease: ADMIN_FILTER_REVEAL_EASE,
      },
    },
    exit: {
      opacity: 0,
      y: 8,
      scale: 0.995,
      filter: "blur(2px)",
      transition: {
        duration: ADMIN_FILTER_REVEAL_MOTION.exitDurationSec,
        ease: ADMIN_FILTER_REVEAL_EASE,
      },
    },
  };
}
