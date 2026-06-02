/**
 * Figma file `ommm`, frame **Hero Section** `155:108`, artboard **1440×924** for the photo stack.
 * Values are taken from Dev Mode exports (May 2026).
 */

export const HOME_HERO_FIGMA = {
  artboardWidthPx: 1440,
  imageHeightPx: 924,
  sectionBottomRadiusPx: 60,
  sectionBackground: "#faf3cb",
  titleAccentSpace: "#577f91",
  primaryCtaBorder: "#f7fbff",
  primaryCtaHighlight: "#ffee6e",
  secondaryCtaBorder: "#fffec9",
  secondaryCtaHighlight: "#fffec9",
  frostPanelFill: "rgba(255, 255, 255, 0.2)",
  frostPanelRadiusPx: 50,
  /** Figma `196:1409` — hero subheading. */
  subtitleColor: "rgba(74, 71, 56, 0.62)",
} as const;

/** Responsive layout derived from Figma artboard `155:108` (1440×924 photo area). */
export const HOME_HERO_LAYOUT = {
  imageAspectRatio: HOME_HERO_FIGMA.artboardWidthPx / HOME_HERO_FIGMA.imageHeightPx,
  /** Matches Figma proportion using svw (aligns with real phones, not only DevTools). */
  imageMinHeightMobile:
    "max(16rem, calc(100svw * 924 / 1440))",
  /** Prevents mobile Safari from stretching hero to full dynamic viewport. */
  imageMaxHeightMobile: "min(42rem, 88dvh)",
  /** Large screens: fluid growth capped at viewport height. */
  imageMinHeightDesktop: "clamp(32.5rem, 64vw, 100svh)",
  heroPanelOverlap: "clamp(1.75rem, 3.4vw, 3.0625rem)",
  portalTop: "15.8%",
  /** Figma `196:1408` inside portal chord `196:1406` at logo band (~39.2% of portal width). */
  logoMarkWidthPx: 130,
  logoMarkHeightPx: 129,
  logoMarkBorderRadiusPx: 91,
  portalWidthRatio: 0.872,
  portalChordAtLogoRatio: 0.392,
  /** Logo diameter ≈ inner visible portal circle (Figma chord × ~0.52). */
  logoMarkPortalFillRatio: 0.52,
  /** Figma `196:1407` — hero headline. */
  titleFontSizePx: 129,
  titleLineHeightPx: 107,
  titleLetterSpacingPx: -1.28,
  titleMaxWidthPx: 1031,
  titleFontSize: "clamp(2.5rem, calc(100svw * 116 / 1440), 7.25rem)",
  titleFontSizeDesktop: "7.25rem",
  titleLineHeight: 107 / 129,
  titleLetterSpacingEm: -1.28 / 129,
  /** Figma `196:1409` — hero subheading. */
  subtitleFontSizePx: 18,
  subtitleLineHeightPx: 24,
  subtitleMaxWidthPx: 436,
  subtitleFontSize: "clamp(1rem, calc(100svw * 18 / 1440), 1.125rem)",
  subtitleLineHeight: 24 / 18,
  backgroundObjectPosition: "48% 42%",
} as const;

const goldGradientSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 191 56" preserveAspectRatio="none"><defs><radialGradient id="g" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="10" gradientTransform="matrix(10.568 0.1 -0.027561 3.0985 98.893 32.5)"><stop offset="0.40385" stop-color="rgb(245,233,136)"/><stop offset="0.70192" stop-color="rgb(222,209,98)"/><stop offset="1" stop-color="rgb(200,185,59)"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`;

const frostGradientSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 191 56" preserveAspectRatio="none"><defs><radialGradient id="f" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="10" gradientTransform="matrix(9.85 -0.05 0.01466 2.888 96 35)"><stop offset="0" stop-color="rgb(134,167,184)"/><stop offset="0.5" stop-color="rgb(176,193,202)"/><stop offset="1" stop-color="rgb(217,219,219)"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#f)"/></svg>`;

function dataUrlFromSvg(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Figma node 161:363 — primary pill fill. */
export const HOME_HERO_CTA_GOLD_BG = dataUrlFromSvg(goldGradientSvg);

/** Figma node 170:1053 — secondary pill fill. */
export const HOME_HERO_CTA_FROST_BG = dataUrlFromSvg(frostGradientSvg);

const scheduleGradientSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 178 56" preserveAspectRatio="none"><defs><radialGradient id="s" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="10" gradientTransform="matrix(9.8487 0.1 -0.025685 3.0985 92.162 32.5)"><stop offset="0.40385" stop-color="rgb(224,223,222)"/><stop offset="0.70192" stop-color="rgb(157,176,183)"/><stop offset="0.85096" stop-color="rgb(123,152,164)"/><stop offset="1" stop-color="rgb(89,128,144)"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#s)"/></svg>`;

/** Figma node `172:1059` — “View schedule” pill fill. */
export const HOME_SCHEDULE_CTA_BG = dataUrlFromSvg(scheduleGradientSvg);

export const HOME_HERO_ASSETS = {
  backgroundImage: "/marketing/home/hero/home-hero-banner-bg.png",
  logoMark: "/marketing/home/hero/home-hero-logo-mark.png",
  portalEllipse: "/marketing/home/hero/home-hero-portal-ellipse.svg",
} as const;

/** Figma hero CTAs — `196:1430` booking, `196:1440` membership. */
export const HOME_HERO_CTA_ASSETS = {
  booking: {
    shape: "/marketing/home/hero/home-hero-cta-booking-shape.svg",
    arrow: "/marketing/home/hero/home-hero-cta-booking-arrow.svg",
  },
  membership: {
    shape: "/marketing/home/hero/home-hero-cta-membership-shape.svg",
    arrow: "/marketing/home/hero/home-hero-cta-membership-arrow.svg",
  },
} as const;

export const HOME_HERO_CTA_LAYOUT = {
  artboardWidthPx: HOME_HERO_FIGMA.artboardWidthPx,
  buttonHeightPx: 61,
  buttonGapPx: 16.375,
  buttonsTopOffsetPx: 27,
  arrowWidthPx: 32,
  arrowHeightPx: 29,
  labelFontSizePx: 16,
  labelLineHeightPx: 28,
  /** Visual scale tweak — slightly smaller than Figma export. */
  buttonScale: 0.88,
  booking: {
    widthPx: 236.625,
    heightPx: 61.136,
    width: "clamp(10rem, calc(100svw * 236.625 * 0.88 / 1440), 13rem)",
    height: "clamp(2.5rem, calc(100svw * 61.136 * 0.88 / 1440), 3.375rem)",
    /** Left pill width / full button — Union `196:1430`. */
    labelWidthRatio: 136.25 / 236.625,
    /** Right circle diameter / full button — centers arrow in the cap. */
    arrowZoneWidthRatio: (2 * (236.625 - 206)) / 236.625,
    /** Optical label nudge within left pill. */
    labelOffsetPx: 11,
  },
  membership: {
    widthPx: 254.375,
    heightPx: 61,
    width: "clamp(10.5rem, calc(100svw * 254.375 * 0.88 / 1440), 14rem)",
    height: "clamp(2.5rem, calc(100svw * 61 * 0.88 / 1440), 3.375rem)",
    labelWidthRatio: 154 / 254.375,
    arrowZoneWidthRatio: (2 * (254.375 - 223.75)) / 254.375,
    labelOffsetPx: 14,
  },
  buttonGap: "clamp(0.625rem, calc(100svw * 16.375 * 0.88 / 1440), 0.9rem)",
  buttonsMarginTop: "clamp(0.625rem, calc(100svw * 14 / 1440), 0.875rem)",
} as const;
