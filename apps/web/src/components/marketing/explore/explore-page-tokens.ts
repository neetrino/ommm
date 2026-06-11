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
  titleDelayMs: 400,
  titleOffsetPx: 14,
  reducedMotionDurationMs: 250,
} as const;

/** Idle float — gentle rise/fall after the entrance finishes. */
export const EXPLORE_PAGE_TITLE_FLOAT = {
  amplitudePx: 10,
  durationMs: 2400,
  startDelayAfterEnterMs: 600,
} as const;

/** Twin golden “o” orbs — pop-in, glow, and counter-phase vertical float. */
export const EXPLORE_INLINE_LOGO_MOTION = {
  enterDelayAfterTitleMs: 180,
  enterDurationMs: 520,
  enterStaggerMs: 140,
  enterRisePx: 18,
  floatDurationMs: 2400,
  floatAmplitudePx: 9,
  floatGlowRgb: "255, 196, 110",
} as const;

/** Symmetric horizontal inset — keeps the title centered with equal edge breathing room. */
export const EXPLORE_PAGE_SURFACE = {
  contentInsetMinPx: 24,
  contentInsetVw: 5,
  contentInsetMaxPx: 48,
  /** Optical tune — slightly left and lower vs geometric center. */
  titleNudgeXPx: -28,
  titleNudgeYPx: 48,
} as const;

/** Layout tokens for the Explore coming soon page. */
export const EXPLORE_PAGE_LAYOUT = {
  titleColor: "rgba(255, 255, 255, 0.96)",
  ...EXPLORE_PAGE_SURFACE,
  ...EXPLORE_COMING_SOON_TYPOGRAPHY,
  ...EXPLORE_PAGE_ENTER,
  ...EXPLORE_PAGE_TITLE_FLOAT,
  ...EXPLORE_INLINE_LOGO_MOTION,
} as const;
