import type { MotionProps } from "framer-motion";

/**
 * Marketing pages — scroll reveal tuned to ANIMO Studios instructors page feel:
 * slow fade (~1s), soft upward slide, row stagger (Squarespace preSlide / slideIn).
 */
export const MARKETING_SCROLL_REVEAL_MOTION = {
  durationSec: 1.05,
  staggerSec: 0.13,
  offsetPx: 40,
  scaleInitial: 0.99,
  viewportAmount: 0.1,
  viewportMargin: "0px 0px -48px 0px",
  reducedMotionDurationSec: 0.35,
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
      scale: MARKETING_SCROLL_REVEAL_MOTION.scaleInitial,
    },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport,
    transition: {
      duration: MARKETING_SCROLL_REVEAL_MOTION.durationSec,
      delay: rowStaggerDelaySec(index, gridColumns),
      ease: MARKETING_SCROLL_REVEAL_EASE,
    },
  };
}
