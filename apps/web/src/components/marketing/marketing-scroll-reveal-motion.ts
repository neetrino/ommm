import type { MotionProps } from "framer-motion";

/**
 * Marketing pages — light scroll reveal: quick fade, subtle upward slide, row stagger.
 * Avoid scale + long duration to keep scroll smooth on dense pages.
 */
export const MARKETING_SCROLL_REVEAL_MOTION = {
  durationSec: 0.68,
  staggerSec: 0.07,
  offsetPx: 14,
  viewportAmount: 0.08,
  viewportMargin: "0px 0px -32px 0px",
  reducedMotionDurationSec: 0.25,
} as const;

/** Standard ease-out — close to Squarespace `transition-timing-function: ease`. */
export const MARKETING_SCROLL_REVEAL_EASE = [0.25, 0.1, 0.25, 1] as const;

function rowStaggerDelaySec(index: number, gridColumns: number): number {
  return (index % gridColumns) * MARKETING_SCROLL_REVEAL_MOTION.staggerSec;
}

export function marketingScrollRevealMotionProps(
  index: number,
  reducedMotion: boolean,
  gridColumns: number,
): MotionProps {
  const viewport = {
    once: true,
    amount: MARKETING_SCROLL_REVEAL_MOTION.viewportAmount,
    margin: MARKETING_SCROLL_REVEAL_MOTION.viewportMargin,
  } as const;

  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      whileInView: { opacity: 1 },
      viewport,
      transition: { duration: MARKETING_SCROLL_REVEAL_MOTION.reducedMotionDurationSec },
    };
  }

  return {
    initial: {
      opacity: 0,
      y: MARKETING_SCROLL_REVEAL_MOTION.offsetPx,
    },
    whileInView: { opacity: 1, y: 0 },
    viewport,
    transition: {
      duration: MARKETING_SCROLL_REVEAL_MOTION.durationSec,
      delay: rowStaggerDelaySec(index, gridColumns),
      ease: MARKETING_SCROLL_REVEAL_EASE,
    },
  };
}
