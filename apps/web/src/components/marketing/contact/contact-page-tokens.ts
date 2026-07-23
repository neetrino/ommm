import {
  CANVAS_TABLET_MIN_WIDTH_PX,
  IPAD_AIR_LANDSCAPE_MAX_WIDTH_PX,
} from "@/lib/viewport-breakpoints";

/** Contact page — glass tile grid tokens. */

export const CONTACT_PAGE_CARD_SHELL_CLASS = "ommm-card";

/** Desktop card elevation — omitted on phone to avoid clipped edge bands. */
export const CONTACT_PAGE_CARD_DESKTOP_SHADOW =
  "0 20px 44px -12px rgba(45, 40, 35, 0.22)";

export const CONTACT_PAGE_SURFACE = {
  headingColor: "#1d1c15",
  labelColor: "#4a4738",
  valueColor: "#1d1c15",
  iconBackground: "rgba(255, 255, 255, 0.85)",
} as const;

export const CONTACT_PAGE_LAYOUT = {
  gridGapPx: 20,
  tilePaddingPx: 24,
  tilePaddingMobilePx: 18,
  tileRowGapPx: 18,
  tileRowGapMobilePx: 14,
  tileMinHeightPx: 104,
  tileMinHeightMobilePx: 0,
  iconSizePx: 56,
  iconSizeMobilePx: 48,
  mobileRowGapPx: 16,
  tileHoverLiftPx: 4,
  tileHoverDurationMs: 280,
  /** Room inside clipped page content so desktop card shadows fade naturally. */
  cardShadowBleedPx: 20,
  /** iPad Mini + Air — row 1: phone, hours; row 2: address, email, Instagram. */
  ipadGridMinWidthPx: CANVAS_TABLET_MIN_WIDTH_PX,
  ipadGridMaxWidthPx: IPAD_AIR_LANDSCAPE_MAX_WIDTH_PX,
  desktopGridMinWidthPx: IPAD_AIR_LANDSCAPE_MAX_WIDTH_PX + 1,
} as const;

/** Above-fold cards — quick mount fade/slide (no scroll intersection wait). */
export const CONTACT_PAGE_REVEAL_MOTION = {
  durationSec: 0.42,
  staggerSec: 0.06,
  offsetPx: 12,
  reducedMotionDurationSec: 0.2,
} as const;
