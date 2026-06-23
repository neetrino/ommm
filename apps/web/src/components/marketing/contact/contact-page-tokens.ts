/** Contact page — glass tile grid tokens. */

export const CONTACT_PAGE_CARD_SHELL_CLASS =
  "ommm-card shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)]";

export const CONTACT_PAGE_SURFACE = {
  headingColor: "#1d1c15",
  labelColor: "#4a4738",
  valueColor: "#1d1c15",
  iconBackground: "rgba(255, 255, 255, 0.85)",
  calloutTileBackground: "rgba(255, 248, 235, 0.58)",
} as const;

export const CONTACT_PAGE_LAYOUT = {
  gridGapPx: 20,
  tilePaddingPx: 24,
  tilePaddingMobilePx: 28,
  tileRowGapPx: 18,
  tileMinHeightPx: 104,
  iconSizePx: 56,
  mobileRowGapPx: 16,
  tileHoverLiftPx: 4,
  tileHoverDurationMs: 280,
} as const;

/** Above-fold cards — quick mount fade/slide (no scroll intersection wait). */
export const CONTACT_PAGE_REVEAL_MOTION = {
  durationSec: 0.42,
  staggerSec: 0.06,
  offsetPx: 12,
  reducedMotionDurationSec: 0.2,
} as const;
