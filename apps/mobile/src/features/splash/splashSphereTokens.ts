/** Figma footer sphere artboard ratio — `HOME_FOOTER_SECTION_MOBILE_FIGMA`. */
export const SPLASH_SPHERE_ASPECT_RATIO = 396 / 400;

/** Total splash visibility before navigation (~3 seconds). */
export const SPLASH_DURATION_MS = 3000;

/** Soft vertical bounce — inspired by web `HOME_FOOTER_MOBILE_SPHERE_BOUNCE`. */
export const SPLASH_SPHERE_BOUNCE = {
  peakPx: 118,
  riseMs: 620,
  fallMs: 640,
  squashMs: 90,
  impactHoldMs: 50,
  squashScaleX: 1.05,
  squashScaleY: 0.9,
  riseStretchScaleX: 0.99,
  riseStretchScaleY: 1.03,
  fadeInMs: 320,
} as const;

export const SPLASH_SPHERE_LAYOUT = {
  /** Push the sphere slightly below the tagline center. */
  offsetDownPx: 168,
} as const;

export const SPLASH_SPHERE_SIZE = {
  minWidthPx: 220,
  maxWidthPx: 320,
  widthRatio: 0.62,
} as const;

/** Web photo hero title — `HOME_HERO_MOBILE_LAYOUT` / `homeHeroTitle`. */
export const SPLASH_TAGLINE_TYPOGRAPHY = {
  fontSizeRatio: 44 / 394,
  minFontSizePx: 34,
  maxFontSizePx: 44,
  /** RN/iOS needs ≥1 line box; web ratio 55/68 clips custom serif ascenders. */
  lineHeightRatio: 1.12,
  letterSpacingEm: -0.02,
  /** Shrink title to fit narrow phones before clipping. */
  minimumFontScale: 0.78,
} as const;
