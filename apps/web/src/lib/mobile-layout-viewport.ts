/** Figma mobile artboard width — home marketing sections below tablet (744px). */
export const MOBILE_FIGMA_ARTBOARD_WIDTH_PX = 394;

/**
 * Fluid horizontal sizing tied to layout viewport width (same metric as DevTools).
 * Set client-side on `:root` by `OmmmLayoutViewportSync` — use in CSS modules only,
 * not in React `style={{}}` props (SSR/client string drift causes hydration errors).
 */
export const MOBILE_LAYOUT_VW_EXPR = "var(--ommm-layout-vw-px, 100svw)";

/** Build `calc(...)` proportional to the mobile Figma artboard. */
export function mobileFigmaCalc(
  figmaPx: number,
  artboardPx: number = MOBILE_FIGMA_ARTBOARD_WIDTH_PX,
): string {
  return `calc(${MOBILE_LAYOUT_VW_EXPR} * ${figmaPx} / ${artboardPx})`;
}
