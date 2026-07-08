/** Mobile schedule page layout — mirrors web `schedule-public-design.module.css` at ~394px. */
export const SCHEDULE_PAGE_MOBILE = {
  pageHorizontalPaddingPx: 16,
  pageTitleSizePx: 44,
  pageTitleLineHeightPx: 42,
  /** Practices-inner hero ink — `STORY_PAGE_LAYOUT.valuesHeadingColor`. */
  pageTitleColor: "#97907c",
  pageTitleToShellGapPx: 20,
  shellRadiusPx: 28,
  shellPaddingPx: 20,
  shellGapPx: 28,
  filtersGapPx: 16,
  monthMarginTopPx: 24,
  stripMarginTopPx: 16,
  dividerMarginTopPx: 32,
  dividerPaddingBottomPx: 14,
  sessionListGapPx: 14,
  spotsUrgentThreshold: 3,
} as const;

/** Shell frosted panel — `viewShell` gradient stops. */
export const SCHEDULE_SHELL_GRADIENT = {
  colors: [
    "rgba(255, 255, 255, 0.78)",
    "rgba(255, 255, 255, 0.58)",
    "rgba(255, 255, 255, 0.66)",
  ] as const,
  locations: [0, 0.48, 1] as const,
  start: { x: 0.05, y: 0 },
  end: { x: 0.95, y: 1 },
} as const;

/** Empty state card gradient — `schedule-empty-state.module.css`. */
export const SCHEDULE_EMPTY_GRADIENT = {
  colors: ["rgba(255, 255, 255, 0.72)", "rgba(255, 255, 255, 0.52)"] as const,
  start: { x: 0.2, y: 0 },
  end: { x: 0.8, y: 1 },
} as const;
