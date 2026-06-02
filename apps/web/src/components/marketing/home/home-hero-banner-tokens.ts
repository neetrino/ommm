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

/** Figma mobile hero container `97:5656` — artboard **394×772**. */
export const HOME_HERO_MOBILE_FIGMA = {
  artboardWidthPx: 394,
  artboardHeightPx: 772,
  /** Figma `108:6566` — primary pill label on white Union. */
  bookingCtaLabelColor: "#97907c",
} as const;

/** Mobile layout from Figma `97:5656` (logo `97:5658`, title `97:5661`, CTAs `108:6561` / `108:6571`). */
export const HOME_HERO_MOBILE_LAYOUT = {
  imageMinHeight: "clamp(18rem, calc(100svw * 772 / 394), 48.25rem)",
  imageMaxHeight: "min(48.25rem, 92dvh)",
  contentPaddingX: "1.5rem",
  /** Figma `97:5658` — frame 240×142, artboard 394. */
  logoFrameWidthPx: 240,
  logoFrameHeightPx: 142,
  logoWidth: "clamp(8rem, calc(100svw * 240 / 394), 15rem)",
  /** Hero image top → logo frame top; nudged ~24px above prior `68px`. */
  logoTop: "clamp(2.5rem, calc(100svw * 44 / 394), 3.5rem)",
  /** Figma `97:5658` inner raster crop (Dev Mode). */
  logoImageHeightPercent: 292.23,
  logoImageTopPercent: -96.11,
  logoFrameHeightRatio: 142 / 240,
  titleMarginTop: "0",
  titleFontSize: "clamp(3rem, calc(100svw * 68 / 394), 4.25rem)",
  titleLineHeight: 55 / 68,
  titleLetterSpacingEm: -0.02,
  titleMaxWidth: "clamp(16rem, calc(100svw * 346 / 394), 21.625rem)",
  subtitleFontSize: "clamp(0.8125rem, calc(100svw * 14 / 394), 0.875rem)",
  subtitleLineHeight: 20 / 14,
  subtitleMaxWidth: "clamp(16rem, calc(100svw * 346 / 394), 21.625rem)",
  subtitleMarginTop: "1rem",
  /** Figma `97:5655` hero photo crop — centers subject on mobile. */
  backgroundImageWidthPercent: 400.46,
  backgroundImageHeightPercent: 103.92,
  backgroundImageLeftPercent: -148.43,
  backgroundImageTopPercent: -3.38,
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

const MOBILE_CTA_WIDTH_PX = 342.48;
const MOBILE_CTA_HEIGHT_PX = 61.747;
const MOBILE_CTA_LABEL_WIDTH_PX = 268.581;
const MOBILE_CTA_ARROW_ZONE_PX = 60;

/** Figma mobile hero CTAs — full-width Union `108:6562` / `108:6572` on artboard `394`. */
export const HOME_HERO_MOBILE_CTA_LAYOUT = {
  artboardWidthPx: HOME_HERO_MOBILE_FIGMA.artboardWidthPx,
  buttonHeightPx: MOBILE_CTA_HEIGHT_PX,
  buttonGapPx: 10.25,
  buttonsTopOffsetPx: 182,
  labelFontSizePx: 16,
  labelFontSize: "clamp(0.9375rem, calc(100svw * 16 / 394), 1.0625rem)",
  booking: {
    widthPx: MOBILE_CTA_WIDTH_PX,
    heightPx: MOBILE_CTA_HEIGHT_PX,
    width: "100%",
    height: "clamp(3.25rem, calc(100svw * 61.747 / 394), 3.875rem)",
    labelWidthRatio: MOBILE_CTA_LABEL_WIDTH_PX / MOBILE_CTA_WIDTH_PX,
    arrowZoneWidthRatio: MOBILE_CTA_ARROW_ZONE_PX / MOBILE_CTA_WIDTH_PX,
    labelOffsetPx: 67,
  },
  membership: {
    widthPx: MOBILE_CTA_WIDTH_PX,
    heightPx: MOBILE_CTA_HEIGHT_PX,
    width: "100%",
    height: "clamp(3.25rem, calc(100svw * 61.747 / 394), 3.875rem)",
    labelWidthRatio: MOBILE_CTA_LABEL_WIDTH_PX / MOBILE_CTA_WIDTH_PX,
    arrowZoneWidthRatio: MOBILE_CTA_ARROW_ZONE_PX / MOBILE_CTA_WIDTH_PX,
    labelOffsetPx: 62,
  },
  buttonGap: "clamp(0.5rem, calc(100svw * 10.25 / 394), 0.75rem)",
  buttonsMarginTop: "clamp(1.25rem, calc(100svw * 150 / 394), 9.375rem)",
} as const;

/** Figma hero CTAs — `196:1430` booking, `196:1440` membership, Featured Coaches `196:1149`. */
export const HOME_HERO_CTA_ASSETS = {
  booking: {
    shape: "/marketing/home/hero/home-hero-cta-booking-shape.svg",
    arrow: "/marketing/home/hero/home-hero-cta-booking-arrow.svg",
    shapeMobile: "/marketing/home/hero/home-hero-cta-booking-shape-mobile.svg",
    arrowMobile: "/marketing/home/hero/home-hero-cta-booking-arrow-mobile.svg",
  },
  membership: {
    shape: "/marketing/home/hero/home-hero-cta-membership-shape.svg",
    arrow: "/marketing/home/hero/home-hero-cta-membership-arrow.svg",
    shapeMobile: "/marketing/home/hero/home-hero-cta-membership-shape-mobile.svg",
    arrowMobile: "/marketing/home/hero/home-hero-cta-membership-arrow-mobile.svg",
  },
  coachesDetails: {
    shape: "/marketing/home/sections/home-coaches-cta-shape.svg",
    arrow: "/marketing/home/sections/home-coaches-cta-arrow.svg",
  },
  plansDetails: {
    shape: "/marketing/home/sections/plans/home-plans-cta-shape.svg",
    arrow: "/marketing/home/sections/plans/home-plans-cta-arrow.svg",
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
  /** Figma Featured Coaches CTA `196:1149` — same Union proportions as booking. */
  coachesDetails: {
    widthPx: 236.625,
    heightPx: 61.136,
    width: "clamp(10rem, calc(100svw * 236.625 * 0.88 / 1440), 13rem)",
    height: "clamp(2.5rem, calc(100svw * 61.136 * 0.88 / 1440), 3.375rem)",
    labelWidthRatio: 136.25 / 236.625,
    arrowZoneWidthRatio: (2 * (236.625 - 206)) / 236.625,
    labelOffsetPx: 11,
  },
  /** Figma Packages CTA `196:1260` — Union `196:1261`, arrow `196:1266`. */
  plansDetails: {
    widthPx: 236.625,
    heightPx: 61.136,
    width: "clamp(10rem, calc(100svw * 236.625 * 0.88 / 1440), 13rem)",
    height: "clamp(2.5rem, calc(100svw * 61.136 * 0.88 / 1440), 3.375rem)",
    labelWidthRatio: 136.25 / 236.625,
    arrowZoneWidthRatio: (2 * (236.625 - 206)) / 236.625,
    labelOffsetPx: 11,
  },
  buttonGap: "clamp(0.625rem, calc(100svw * 16.375 * 0.88 / 1440), 0.9rem)",
  buttonsMarginTop: "clamp(0.625rem, calc(100svw * 14 / 1440), 0.875rem)",
} as const;
