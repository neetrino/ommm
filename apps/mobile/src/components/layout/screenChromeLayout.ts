import { space } from "../../theme/tokens";

/**
 * Shared chrome metrics for absolute AppHeader + FloatingTabBar.
 * Compact values apply in landscape / short viewports (tab bar only).
 */

/** Full brand mark — header row height matches this so the circle never clips. */
export const APP_HEADER_LOGO_SIZE = 96;

/**
 * Space below safe-area top for scroll content to clear AppHeader
 * (logo row + blur bottom pad + small gap).
 */
export const APP_HEADER_CONTENT_CLEARANCE =
  APP_HEADER_LOGO_SIZE + space.md + space.sm;

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

export function appHeaderScrollPaddingTop(insetsTop: number): number {
  return insetsTop + APP_HEADER_CONTENT_CLEARANCE;
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
