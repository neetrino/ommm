/** Figma desktop artboard width — canvas scaler design width. */
export const CANVAS_DESIGN_WIDTH_PX = 1440;

/** Below this width: real mobile layout (no canvas scaling). */
export const CANVAS_TABLET_MIN_WIDTH_PX = 744;

/** iPad Air portrait logical width — scales Pro-tier tokens down. */
export const IPAD_AIR_REFERENCE_WIDTH_PX = 820;

/** iPad Air tier — same layout as iPad Pro, smaller (744px–1023px). */
export const IPAD_AIR_MIN_WIDTH_PX = CANVAS_TABLET_MIN_WIDTH_PX;
export const IPAD_AIR_MAX_WIDTH_PX = 1023;

/** iPad Pro tier reference width for proportional scaling (1024px–1366px). */
export const IPAD_PRO_TIER_REFERENCE_WIDTH_PX = 1024;
export const IPAD_PRO_MAX_WIDTH_PX = 1366;

/** Scale fixed Pro-tier px values for iPad Air (820 / 1024). */
export const IPAD_AIR_TO_PRO_SCALE =
  IPAD_AIR_REFERENCE_WIDTH_PX / IPAD_PRO_TIER_REFERENCE_WIDTH_PX;

/** Rounds scaled px for CSS custom properties on iPad Air. */
export function scaleIpadAirPx(valuePx: number): number {
  return Math.round(valuePx * IPAD_AIR_TO_PRO_SCALE);
}

/** Full-size inline marketing nav — above largest iPad Pro landscape (1366px). */
export const NAV_DESKTOP_MIN_WIDTH_PX = 1367;

/** Native 1:1 content — no scale above 1. */
export const CONTENT_DESKTOP_MIN_WIDTH_PX = 1440;

/** App shells: sidebar dock vs drawer (unchanged from Tailwind default). */
export const APP_SIDEBAR_MIN_WIDTH_PX = 1024;

/** iPad Pro / tablet tier — compact nav between lg and nav-desktop. */
export const NAV_TABLET_COMPACT_MIN_WIDTH_PX = APP_SIDEBAR_MIN_WIDTH_PX;

/** Home sections below hero — canvas scale from this width (iPad uses native full-width layout). */
export const HOME_CANVAS_SCALE_MIN_WIDTH_PX = APP_SIDEBAR_MIN_WIDTH_PX;

/** Minimum effective touch target (px) when UI is canvas-scaled. */
export const MIN_TOUCH_TARGET_PX = 44;

/** List/board toggle — tablet and desktop; phones always use card view. */
export const LIST_BOARD_VIEW_MIN_WIDTH_PX = CANVAS_TABLET_MIN_WIDTH_PX;

export const LIST_BOARD_VIEW_MEDIA_QUERY = `(min-width: ${LIST_BOARD_VIEW_MIN_WIDTH_PX}px)`;

/** Keeps list/board toggles in layout on tablet+ without a hydration flash (matches min width above). */
export const LIST_BOARD_VIEW_SWITCHER_VISIBILITY_CLASS =
  "hidden min-[744px]:inline-flex" as const;
