import type { MotionProps } from "framer-motion";

/** Shared marketing page — staggered section/card entrance on scroll. */
export const MARKETING_REVEAL_MOTION = {
  durationSec: 0.78,
  staggerSec: 0.1,
  offsetPx: 12,
  viewportAmount: 0.12,
} as const;

export const MARKETING_REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

export function marketingRevealMotionProps(
  index: number,
  reducedMotion: boolean,
): MotionProps {
  if (reducedMotion) {
    return {};
  }

  return {
    initial: { opacity: 0, y: MARKETING_REVEAL_MOTION.offsetPx },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: MARKETING_REVEAL_MOTION.viewportAmount },
    transition: {
      duration: MARKETING_REVEAL_MOTION.durationSec,
      delay: index * MARKETING_REVEAL_MOTION.staggerSec,
      ease: MARKETING_REVEAL_EASE,
    },
  };
}
