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
  titleFontSize: "clamp(2.75rem, 11vw, 4.5rem)",
  titleFontSizeDesktop: "clamp(2.75rem, 5.5vw, 8.0625rem)",
  titleLineHeight: 107 / 129,
  backgroundObjectPosition: "48% 42%",
} as const;

/** WCAG-friendly subcopy on the photographic hero (Figma export targets pale UI, not the photo). */
export const HOME_HERO_SUBTITLE_ON_IMAGE = "rgba(255, 255, 255, 0.88)";

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
