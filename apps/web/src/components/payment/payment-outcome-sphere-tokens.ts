import {
  HOME_FOOTER_SECTION_MOBILE_FIGMA,
  HOME_FOOTER_SPHERE_BOUNCE,
} from "@/components/marketing/home/home-footer-section-tokens";

/** Payment outcome sphere = half of the footer mobile illustration. */
const PAYMENT_SPHERE_SCALE = 0.5;

export const PAYMENT_OUTCOME_SPHERE_SIZE = {
  widthPx: Math.round(HOME_FOOTER_SECTION_MOBILE_FIGMA.illustrationWidthPx * PAYMENT_SPHERE_SCALE),
  heightPx: Math.round(HOME_FOOTER_SECTION_MOBILE_FIGMA.illustrationHeightPx * PAYMENT_SPHERE_SCALE),
} as const;

function scaleBouncePx(value: number): number {
  return Math.round(value * PAYMENT_SPHERE_SCALE);
}

/** Same footer bounce loop — scaled down for the payment card stage. */
export const PAYMENT_OUTCOME_SPHERE_BOUNCE = {
  ...HOME_FOOTER_SPHERE_BOUNCE,
  minWidthPx: 0,
  peakBasePx: scaleBouncePx(HOME_FOOTER_SPHERE_BOUNCE.peakBasePx),
  peakBoostMinPx: scaleBouncePx(HOME_FOOTER_SPHERE_BOUNCE.peakBoostMinPx),
  peakBoostMaxPx: scaleBouncePx(HOME_FOOTER_SPHERE_BOUNCE.peakBoostMaxPx),
  driftPx: scaleBouncePx(HOME_FOOTER_SPHERE_BOUNCE.driftPx),
  driftMaxPx: scaleBouncePx(HOME_FOOTER_SPHERE_BOUNCE.driftMaxPx),
  maxDropPx: 52,
} as const;
