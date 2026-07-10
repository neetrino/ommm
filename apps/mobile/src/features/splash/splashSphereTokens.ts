/** Figma footer sphere artboard ratio — `HOME_FOOTER_SECTION_MOBILE_FIGMA`. */
export const SPLASH_SPHERE_ASPECT_RATIO = 396 / 400;

/** Total splash visibility before navigation (~4 seconds). */
export const SPLASH_DURATION_MS = 3000;

/** Soft vertical bounce — inspired by web `HOME_FOOTER_MOBILE_SPHERE_BOUNCE`. */
export const SPLASH_SPHERE_BOUNCE = {
  peakPx: 52,
  riseMs: 520,
  fallMs: 560,
  squashMs: 90,
  impactHoldMs: 50,
  squashScaleX: 1.05,
  squashScaleY: 0.9,
  riseStretchScaleX: 0.99,
  riseStretchScaleY: 1.03,
  fadeInMs: 320,
} as const;

export const SPLASH_SPHERE_SIZE = {
  minWidthPx: 220,
  maxWidthPx: 320,
  widthRatio: 0.62,
} as const;
