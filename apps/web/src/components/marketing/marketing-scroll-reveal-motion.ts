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

export type MarketingScrollRevealMotionProfile = {
  durationSec: number;
  staggerSec: number;
  offsetPx: number;
  reducedMotionDurationSec: number;
};

export type MarketingScrollRevealEntrance = "scroll" | "aboveFold";

/** Standard ease-out — close to Squarespace `transition-timing-function: ease`. */
export const MARKETING_SCROLL_REVEAL_EASE = [0.25, 0.1, 0.25, 1] as const;

function rowStaggerDelaySec(
  index: number,
  gridColumns: number,
  profile: MarketingScrollRevealMotionProfile,
): number {
  return (index % gridColumns) * profile.staggerSec;
}

export function marketingScrollRevealMotionProps(
  index: number,
  reducedMotion: boolean,
  gridColumns: number,
  skipEntrance = false,
  options?: {
    entrance?: MarketingScrollRevealEntrance;
    profile?: MarketingScrollRevealMotionProfile;
  },
): MotionProps {
  const entrance = options?.entrance ?? "scroll";
  const profile = options?.profile ?? MARKETING_SCROLL_REVEAL_MOTION;
  const viewport = {
    once: true,
    amount: MARKETING_SCROLL_REVEAL_MOTION.viewportAmount,
    margin: MARKETING_SCROLL_REVEAL_MOTION.viewportMargin,
  } as const;

  if (skipEntrance) {
    return {
      initial: false,
      viewport,
    };
  }

  const delay = rowStaggerDelaySec(index, gridColumns, profile);

  if (reducedMotion) {
    const reducedTransition = { duration: profile.reducedMotionDurationSec, delay };
    if (entrance === "aboveFold") {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: reducedTransition,
      };
    }
    return {
      initial: { opacity: 0 },
      whileInView: { opacity: 1 },
      viewport,
      transition: reducedTransition,
    };
  }

  const transition = {
    duration: profile.durationSec,
    delay,
    ease: MARKETING_SCROLL_REVEAL_EASE,
  };

  if (entrance === "aboveFold") {
    return {
      initial: {
        opacity: 0,
        y: profile.offsetPx,
      },
      animate: { opacity: 1, y: 0 },
      transition,
    };
  }

  return {
    initial: {
      opacity: 0,
      y: profile.offsetPx,
    },
    whileInView: { opacity: 1, y: 0 },
    viewport,
    transition,
  };
}
