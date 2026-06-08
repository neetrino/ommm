import type { MotionProps } from "framer-motion";
import { COACHES_PAGE_LAYOUT } from "@/components/marketing/coaches/coaches-page-tokens";

/**
 * Coaches grid — scroll reveal tuned to ANIMO Studios instructors page feel:
 * slow fade (~1s), soft upward slide, row stagger (Squarespace preSlide / slideIn).
 */
export const COACHES_PAGE_REVEAL_MOTION = {
  durationSec: 1.05,
  staggerSec: 0.13,
  offsetPx: 40,
  scaleInitial: 0.99,
  viewportAmount: 0.1,
  viewportMargin: "0px 0px -48px 0px",
  reducedMotionDurationSec: 0.35,
} as const;

/** Standard ease-out — close to Squarespace `transition-timing-function: ease`. */
export const COACHES_PAGE_REVEAL_EASE = [0.25, 0.1, 0.25, 1] as const;

function rowStaggerDelaySec(index: number): number {
  return (index % COACHES_PAGE_LAYOUT.gridColumns) * COACHES_PAGE_REVEAL_MOTION.staggerSec;
}

export function coachesPageRevealMotionProps(
  index: number,
  reducedMotion: boolean,
): MotionProps {
  const viewport = {
    once: true,
    amount: COACHES_PAGE_REVEAL_MOTION.viewportAmount,
    margin: COACHES_PAGE_REVEAL_MOTION.viewportMargin,
  } as const;

  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      whileInView: { opacity: 1 },
      viewport,
      transition: { duration: COACHES_PAGE_REVEAL_MOTION.reducedMotionDurationSec },
    };
  }

  return {
    initial: {
      opacity: 0,
      y: COACHES_PAGE_REVEAL_MOTION.offsetPx,
      scale: COACHES_PAGE_REVEAL_MOTION.scaleInitial,
    },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport,
    transition: {
      duration: COACHES_PAGE_REVEAL_MOTION.durationSec,
      delay: rowStaggerDelaySec(index),
      ease: COACHES_PAGE_REVEAL_EASE,
    },
  };
}
