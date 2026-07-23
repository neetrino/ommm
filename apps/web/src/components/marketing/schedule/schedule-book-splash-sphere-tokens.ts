import {
  HOME_FOOTER_SECTION_MOBILE_FIGMA,
  HOME_FOOTER_SPHERE_BOUNCE,
} from "@/components/marketing/home/home-footer-section-tokens";

/** Compact bouncing sphere for the schedule booking splash modal. */
const SCHEDULE_BOOK_SPLASH_SPHERE_SCALE = 0.14;

export const SCHEDULE_BOOK_SPLASH_SPHERE_SIZE = {
  widthPx: Math.round(
    HOME_FOOTER_SECTION_MOBILE_FIGMA.illustrationWidthPx * SCHEDULE_BOOK_SPLASH_SPHERE_SCALE,
  ),
  heightPx: Math.round(
    HOME_FOOTER_SECTION_MOBILE_FIGMA.illustrationHeightPx * SCHEDULE_BOOK_SPLASH_SPHERE_SCALE,
  ),
} as const;

function scaleSplashBouncePx(value: number): number {
  return Math.round(value * SCHEDULE_BOOK_SPLASH_SPHERE_SCALE);
}

export const SCHEDULE_BOOK_SPLASH_SPHERE_BOUNCE = {
  ...HOME_FOOTER_SPHERE_BOUNCE,
  minWidthPx: 0,
  peakBasePx: scaleSplashBouncePx(HOME_FOOTER_SPHERE_BOUNCE.peakBasePx),
  peakBoostMinPx: scaleSplashBouncePx(HOME_FOOTER_SPHERE_BOUNCE.peakBoostMinPx),
  peakBoostMaxPx: scaleSplashBouncePx(HOME_FOOTER_SPHERE_BOUNCE.peakBoostMaxPx),
  driftPx: scaleSplashBouncePx(HOME_FOOTER_SPHERE_BOUNCE.driftPx),
  driftMaxPx: scaleSplashBouncePx(HOME_FOOTER_SPHERE_BOUNCE.driftMaxPx),
  groundReachPx: 4,
  maxDropPx: 16,
} as const;
