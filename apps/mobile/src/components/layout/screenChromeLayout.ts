import { space } from "../../theme/tokens";

/**
 * Shared chrome metrics for absolute AppHeader + FloatingTabBar.
 * Compact values apply in landscape / short viewports (tab bar only).
 */

/**
 * Small spinning sphere beside Book a Class (matches header CTA height band).
 */
export const APP_HEADER_SPHERE_SIZE = 48;

/**
 * Small pad under the status bar before the sphere / Book CTA row.
 * Keeps the shell flush to the top while giving a taller cream band.
 */
export const APP_HEADER_TOP_PAD = space.sm;

/** Space under the sphere / Book CTA before the rounded header edge. */
export const APP_HEADER_BOTTOM_PAD = space.lg;

/** Header row height — sphere + vertical breathing room. */
export const APP_HEADER_ROW_MIN_HEIGHT = APP_HEADER_SPHERE_SIZE + space.xs;

/**
 * @deprecated Use `APP_HEADER_SPHERE_SIZE` — kept for any leftover imports.
 */
export const APP_HEADER_LOGO_SIZE = APP_HEADER_SPHERE_SIZE;

/**
 * Extra space between the AppHeader bottom edge and page content.
 * Used by every screen that opts into `header: "app"` chrome.
 */
export const APP_HEADER_CONTENT_GAP = space.xl;

/**
 * Space below safe-area top for scroll content to clear AppHeader
 * (top pad + row + bottom pad + content gap).
 */
export const APP_HEADER_CONTENT_CLEARANCE =
  APP_HEADER_TOP_PAD +
  APP_HEADER_ROW_MIN_HEIGHT +
  APP_HEADER_BOTTOM_PAD +
  APP_HEADER_CONTENT_GAP;

export const FLOATING_TAB_BAR_HEIGHT = 88;
/** Landscape / short: icon chip + single-line label fully inside the pill. */
export const FLOATING_TAB_BAR_HEIGHT_COMPACT = 56;
/** Portrait icon chip — slightly under bar height so a label line fits below. */
export const TAB_HIGHLIGHT_SIZE = 56;
/** Smaller icon chip in landscape so full words remain readable. */
export const TAB_HIGHLIGHT_SIZE_COMPACT = 28;

/** Matches FloatingTabBar outer `bottom` extra beyond safe-area / space.sm. */
export const FLOATING_TAB_BAR_OUTER_BOTTOM_EXTRA = space.xs;

/**
 * Use compact chrome when landscape, or when height is too short for portrait chrome.
 */
export const COMPACT_CHROME_MAX_HEIGHT = 500;

export function appHeaderScrollPaddingTop(
  insetsTop: number,
  options?: { contentGap?: number },
): number {
  const contentGap = options?.contentGap ?? APP_HEADER_CONTENT_GAP;
  return (
    insetsTop +
    APP_HEADER_TOP_PAD +
    APP_HEADER_ROW_MIN_HEIGHT +
    APP_HEADER_BOTTOM_PAD +
    contentGap
  );
}

export function tabBarScrollPaddingBottom(
  insetsBottom: number,
  options?: { compact?: boolean; contentGap?: number },
): number {
  const compact = options?.compact ?? false;
  const contentGap = options?.contentGap ?? space.xl;
  const barHeight = compact
    ? FLOATING_TAB_BAR_HEIGHT_COMPACT
    : FLOATING_TAB_BAR_HEIGHT;
  return (
    barHeight +
    Math.max(insetsBottom, space.sm) +
    FLOATING_TAB_BAR_OUTER_BOTTOM_EXTRA +
    contentGap
  );
}
