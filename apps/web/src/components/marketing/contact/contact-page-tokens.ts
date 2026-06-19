/** Contact page — layout and surface tokens aligned with schedule `ommm-card`. */

export const CONTACT_PAGE_CARD_SHELL_CLASS =
  "ommm-card shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)]";

export const CONTACT_PAGE_SURFACE = {
  calloutBackground: "rgba(255, 255, 255, 0.42)",
  headingColor: "#1d1c15",
  labelColor: "#4a4738",
  valueColor: "#1d1c15",
  iconBackground: "rgba(255, 255, 255, 0.85)",
} as const;

export const CONTACT_PAGE_LAYOUT = {
  cardRadiusPx: 28,
  cardPaddingPx: 36,
  cardGapPx: 28,
  iconSizePx: 56,
  socialIconSizePx: 40,
  calloutRadiusPx: 16,
} as const;

/** Above-fold cards — quick mount fade/slide (no scroll intersection wait). */
export const CONTACT_PAGE_REVEAL_MOTION = {
  durationSec: 0.42,
  staggerSec: 0.06,
  offsetPx: 12,
  reducedMotionDurationSec: 0.2,
} as const;
