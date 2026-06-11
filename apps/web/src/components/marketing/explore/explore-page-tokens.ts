/** Figma `301:399` — inline “o” sphere in Coming Soon title. */
export const EXPLORE_INLINE_LOGO_FIGMA = {
  widthPx: 130,
  heightPx: 129,
  borderRadiusPx: 91,
} as const;

/** Slightly below Figma `301:399` — tuned on device. */
const EXPLORE_INLINE_LOGO_SCALE = 0.93;

const EXPLORE_INLINE_LOGO_WIDTH_PX = EXPLORE_INLINE_LOGO_FIGMA.widthPx * EXPLORE_INLINE_LOGO_SCALE;
const EXPLORE_INLINE_LOGO_HEIGHT_PX = EXPLORE_INLINE_LOGO_FIGMA.heightPx * EXPLORE_INLINE_LOGO_SCALE;

/** Figma `422:1810` artboard (1440×902). Type sizes measured from the export. */
export const EXPLORE_COMING_SOON_TYPOGRAPHY = {
  artboardWidthPx: 1440,
  titleFontSizePx: 220,
  titleFontWeight: 700,
  titleLineGapEm: 0.10,
  /** Viewport-scaled — independent from title font-size so logos stay fixed when type grows. */
  inlineLogoWidthRatio: EXPLORE_INLINE_LOGO_WIDTH_PX / 1440,
  inlineLogoHeightRatio: EXPLORE_INLINE_LOGO_HEIGHT_PX / 1440,
  inlineLogoBorderRadiusRatio:
    EXPLORE_INLINE_LOGO_FIGMA.borderRadiusPx / EXPLORE_INLINE_LOGO_FIGMA.widthPx,
  inlineLogoGapPx: 3,
} as const;

/** Page-load entrance — background then title. */
export const EXPLORE_PAGE_ENTER = {
  backgroundDurationMs: 520,
  titleDurationMs: 680,
  titleDelayMs: 140,
  titleOffsetPx: 14,
  reducedMotionDurationMs: 250,
} as const;

/** Layout tokens for the Explore coming soon page. */
export const EXPLORE_PAGE_LAYOUT = {
  titleColor: "rgba(255, 255, 255, 0.96)",
  ...EXPLORE_COMING_SOON_TYPOGRAPHY,
  ...EXPLORE_PAGE_ENTER,
} as const;
