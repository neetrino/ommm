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
