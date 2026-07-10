import { scaleIpadAirPx } from "@/lib/viewport-breakpoints";
import { MARKETING_CONTENT_INLINE_INSET } from "@/components/marketing/marketing-content-layout";
import { MARKETING_DESKTOP_NAV_IPAD_PILL_INSET } from "@/components/marketing/marketing-site-header-layout";

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

/** Shorter than Figma artboard — crops hero photo bottom, tightens subtitle ↔ head gap. */
const HOME_HERO_MOBILE_RENDER_HEIGHT_PX = 680;
const HOME_HERO_MOBILE_RENDER_MIN_HEIGHT_PX = 288;
const HOME_HERO_MOBILE_RENDER_HEIGHT_REM = HOME_HERO_MOBILE_RENDER_HEIGHT_PX / 16;
const HOME_HERO_MOBILE_RENDER_MIN_HEIGHT_REM = HOME_HERO_MOBILE_RENDER_MIN_HEIGHT_PX / 16;

/** Mobile layout from Figma `97:5656` (logo `97:5658`, title `97:5661`, CTAs `108:6561` / `108:6571`). */
export const HOME_HERO_MOBILE_LAYOUT = {
  renderHeightPx: HOME_HERO_MOBILE_RENDER_HEIGHT_PX,
  imageMinHeight: `clamp(${HOME_HERO_MOBILE_RENDER_MIN_HEIGHT_REM}rem, calc(100svw * ${HOME_HERO_MOBILE_RENDER_HEIGHT_PX} / ${HOME_HERO_MOBILE_FIGMA.artboardWidthPx}), ${HOME_HERO_MOBILE_RENDER_HEIGHT_REM}rem)`,
  imageMaxHeight: `min(${HOME_HERO_MOBILE_RENDER_HEIGHT_REM}rem, 88dvh)`,
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
  /** Nudge headline block — mobile only; logo position unchanged. */
  textStackOffsetTopPx: 5,
  textStackOffsetTop: "clamp(-0.5rem, calc(100svw * -5 / 394), 0px)",
  /** Shifts headline + CTAs down together on mobile. */
  contentDownOffsetPx: 40,
  contentDownOffset: "clamp(1.25rem, calc(100svw * 40 / 394), 2.5rem)",
  /** Centers meditating figure in shortened mobile hero crop. */
  backgroundObjectPosition: "center center",
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

const HOME_HERO_PROMO_BANNER_ARTBOARD_WIDTH_PX = 1440;
const HOME_HERO_PROMO_BANNER_ARTBOARD_HEIGHT_PX = 924;
const HOME_HERO_PROMO_BANNER_MOBILE_ARTBOARD_WIDTH_PX = 393;
const HOME_HERO_PROMO_BANNER_MOBILE_ARTBOARD_HEIGHT_PX = 852;

export const HOME_HERO_ASSETS = {
  backgroundImage: "/marketing/home/hero/home-hero-banner-bg.webp",
  /** Figma `887:808` (`887:800` bg + `887:801` subject) @2x — 2880×1848 retina desktop. */
  promoBanner3: "/marketing/home/hero/home-hero-promo-banner-3-v7.webp",
  /** Figma `881:800` mobile banner — 1179×2556 @3x (393×852 artboard), WebP q98. */
  promoBanner3Mobile: "/marketing/home/hero/home-hero-promo-banner-3-mobile-v8.webp",
  /** Promo CTA pill — 465×87 PNG; leading `0` is baked into the left disc. */
  promoBannerCtaPill: "/marketing/home/hero/home-hero-promo-banner-cta-pill.png",
  logoMark: "/marketing/home/hero/home-hero-logo-mark.webp",
  portalEllipse: "/marketing/home/hero/home-hero-portal-ellipse.svg",
} as const;

/** Static mark raster — visible ball bbox in `home-hero-logo-mark.webp` (524×906 source). */
const HOME_HERO_LOGO_MARK_STATIC_BALL_WIDTH_PX = 245;
const HOME_HERO_LOGO_MARK_STATIC_SOURCE_WIDTH_PX = 524;

/**
 * Visible ball / logo frame height on mobile — matches Figma `97:5658` crop
 * (`logoImageHeightPercent` + `logoImageTopPercent` on 240×142 frame).
 */
const HOME_HERO_LOGO_MARK_VIDEO_MOBILE_INNER_SIZE_RATIO =
  (HOME_HERO_LOGO_MARK_STATIC_BALL_WIDTH_PX / HOME_HERO_LOGO_MARK_STATIC_SOURCE_WIDTH_PX) /
  (HOME_HERO_MOBILE_LAYOUT.logoFrameHeightPx / HOME_HERO_MOBILE_LAYOUT.logoFrameWidthPx);

/** Extra scale-down — video ball reads larger than the static raster at matched crop. */
const HOME_HERO_LOGO_MARK_VIDEO_SIZE_ADJUST = 0.60;

/** Mobile legacy slide — video mark reads smaller than Figma; boost size + width. */
const HOME_HERO_LOGO_MARK_VIDEO_MOBILE_SIZE_BOOST = 1.42;
const HOME_HERO_LOGO_MARK_VIDEO_MOBILE_WIDTH_ARTBOARD_PX = 304;

/** Desktop — static mark `object-position: 44% 36%` leaves a small inset vs full frame. */
const HOME_HERO_LOGO_MARK_VIDEO_DESKTOP_INNER_SIZE_RATIO = 0.9;

/** Crops black matte left after H.264 transcode (source had alpha; sphere ≈ 90% of frame). */
const HOME_HERO_LOGO_MARK_VIDEO_EDGE_CROP_SCALE = 1.14;

const HOME_HERO_LOGO_MARK_VIDEO_OFFSET_Y_DESKTOP_PX = 80;
const HOME_HERO_LOGO_MARK_VIDEO_OFFSET_Y_IPAD_PX = 64;
const HOME_HERO_LOGO_MARK_VIDEO_OFFSET_Y_MOBILE_PX = 32;

/** Legacy hero slide — ball sizing matched to static mark. */
export const HOME_HERO_LOGO_MARK_VIDEO_LAYOUT = {
  mobileInnerSizeRatio:
    HOME_HERO_LOGO_MARK_VIDEO_MOBILE_INNER_SIZE_RATIO *
    HOME_HERO_LOGO_MARK_VIDEO_SIZE_ADJUST *
    HOME_HERO_LOGO_MARK_VIDEO_MOBILE_SIZE_BOOST,
  mobileWidth: `clamp(10rem, calc(100svw * ${HOME_HERO_LOGO_MARK_VIDEO_MOBILE_WIDTH_ARTBOARD_PX} / ${HOME_HERO_MOBILE_FIGMA.artboardWidthPx}), 19rem)`,
  desktopInnerSizeRatio:
    HOME_HERO_LOGO_MARK_VIDEO_DESKTOP_INNER_SIZE_RATIO * HOME_HERO_LOGO_MARK_VIDEO_SIZE_ADJUST,
  edgeCropScale: HOME_HERO_LOGO_MARK_VIDEO_EDGE_CROP_SCALE,
  offsetYDesktopPx: HOME_HERO_LOGO_MARK_VIDEO_OFFSET_Y_DESKTOP_PX,
  offsetYIpadPx: HOME_HERO_LOGO_MARK_VIDEO_OFFSET_Y_IPAD_PX,
  offsetYMobilePx: HOME_HERO_LOGO_MARK_VIDEO_OFFSET_Y_MOBILE_PX,
  offsetYMobile: `calc(100svw * ${HOME_HERO_LOGO_MARK_VIDEO_OFFSET_Y_MOBILE_PX} / ${HOME_HERO_MOBILE_FIGMA.artboardWidthPx})`,
} as const;

/** Must match `HOME_HERO_CAROUSEL_SLIDES.length` in home-hero-slide-context. */
export const HOME_HERO_CAROUSEL_SLIDE_COUNT = 3;

/** Figma `887:808` — Pilates promo banner (background `887:800` + subject `887:801`). */
export const HOME_HERO_PROMO_BANNER_LAYOUT = {
  artboardWidthPx: HOME_HERO_PROMO_BANNER_ARTBOARD_WIDTH_PX,
  artboardHeightPx: HOME_HERO_PROMO_BANNER_ARTBOARD_HEIGHT_PX,
  imageWidthPx: HOME_HERO_PROMO_BANNER_ARTBOARD_WIDTH_PX,
  imageHeightPx: HOME_HERO_PROMO_BANNER_ARTBOARD_HEIGHT_PX,
  aspectRatio: `${HOME_HERO_PROMO_BANNER_ARTBOARD_WIDTH_PX} / ${HOME_HERO_PROMO_BANNER_ARTBOARD_HEIGHT_PX}`,
  figmaNodeId: "887:808",
  sectionBackground: "#c4a962",
  /** Desktop — subject sits on the right inside the shared hero band. */
  objectPosition: "center center",
} as const;

/** Mobile promo slide — Figma `881:800` / phone frame `882:809`. */
export const HOME_HERO_PROMO_BANNER_MOBILE_LAYOUT = {
  artboardWidthPx: HOME_HERO_PROMO_BANNER_MOBILE_ARTBOARD_WIDTH_PX,
  artboardHeightPx: HOME_HERO_PROMO_BANNER_MOBILE_ARTBOARD_HEIGHT_PX,
  aspectRatio: `${HOME_HERO_PROMO_BANNER_MOBILE_ARTBOARD_WIDTH_PX} / ${HOME_HERO_PROMO_BANNER_MOBILE_ARTBOARD_HEIGHT_PX}`,
  sectionBackground: "#c4a962",
  /** Figma crop — image fills frame at 122% width, anchored top. */
  objectPosition: "center top",
} as const;

/** Figma `887:840` Banner correct — live promo copy overlay. */
export const HOME_HERO_PROMO_BANNER_TEXT_FIGMA = {
  textColor: "#fbf5d5",
  desktopArtboardWidthPx: 1896,
  desktopArtboardHeightPx: 1209,
  /** Figma `882:809` phone frame — text aligns to `881:800` banner (393×852). */
  mobileArtboardWidthPx: 393,
  mobileArtboardHeightPx: 852,
} as const;

/** Horizontal inset for promo copy — left edge of navbar pill (`ommm-container` edge). */
export const HOME_HERO_PROMO_BANNER_TEXT_NAV_INSET = `max(${MARKETING_CONTENT_INLINE_INSET}, calc((100vw - min(1280px, 100vw - 2rem)) / 2))`;

/**
 * iPad tier — extra inset so promo copy tracks the narrowed nav pill (744px–1366px).
 * Half of {@link MARKETING_DESKTOP_NAV_IPAD_PILL_INSET} per edge.
 */
export const HOME_HERO_PROMO_BANNER_TEXT_IPAD_PILL_EDGE_OFFSET = {
  air: `calc(0.5 * ${MARKETING_DESKTOP_NAV_IPAD_PILL_INSET.airTotalRem})`,
  pro: `calc(0.5 * ${MARKETING_DESKTOP_NAV_IPAD_PILL_INSET.proTotalRem})`,
} as const;

/** Shifts all promo copy blocks up — subtracted from Figma `topPx` before scaling. */
export const HOME_HERO_PROMO_BANNER_TEXT_SHIFT_UP_PX = {
  desktop: 40,
  mobile: 0,
} as const;

/** Inter-block vertical gaps — Figma desktop `887:805`–`887:807`. */
const HOME_HERO_PROMO_BANNER_TEXT_DESKTOP_GAP_PX = {
  /** Figma `887:805` top (755) − unified headline bottom (656). Full desktop only. */
  headlineToLimited: 99,
  limitedToCta: 56,
} as const;

/** iPad desktop copy — tighter gap before limited block (744px–1366px). */
const HOME_HERO_PROMO_BANNER_IPAD_HEADLINE_TO_LIMITED_GAP_PX = 58;

/** Mobile — tighter headline→limited gap on phone artboard (393×852). */
const HOME_HERO_PROMO_BANNER_MOBILE_HEADLINE_TO_LIMITED_GAP_PX = 24;

/** Pull limited + CTA up on iPad to restore smaller headline→limited gap. */
export const HOME_HERO_PROMO_BANNER_TEXT_IPAD_LIMITED_CTA_PULL_UP_PX =
  HOME_HERO_PROMO_BANNER_TEXT_DESKTOP_GAP_PX.headlineToLimited -
  HOME_HERO_PROMO_BANNER_IPAD_HEADLINE_TO_LIMITED_GAP_PX;

function scalePromoBannerTextGapToMobileArtboard(gapPx: number): number {
  return Math.round(
    (gapPx * HOME_HERO_PROMO_BANNER_TEXT_FIGMA.mobileArtboardHeightPx) /
      HOME_HERO_PROMO_BANNER_TEXT_FIGMA.desktopArtboardHeightPx,
  );
}

const HOME_HERO_PROMO_BANNER_DESKTOP_HEADLINE_TOP_PX = 266;
const HOME_HERO_PROMO_BANNER_DESKTOP_HEADLINE_FONT_SIZE_PX = 120;
const HOME_HERO_PROMO_BANNER_DESKTOP_HEADLINE_FOUNDING_LINE_HEIGHT_PX = 130;
const HOME_HERO_PROMO_BANNER_DESKTOP_HEADLINE_ARE_OPEN_LINE_HEIGHT_PX = 130;
const HOME_HERO_PROMO_BANNER_DESKTOP_HEADLINE_HEIGHT_PX =
  HOME_HERO_PROMO_BANNER_DESKTOP_HEADLINE_FOUNDING_LINE_HEIGHT_PX * 2 +
  HOME_HERO_PROMO_BANNER_DESKTOP_HEADLINE_ARE_OPEN_LINE_HEIGHT_PX;

const HOME_HERO_PROMO_BANNER_DESKTOP_LIMITED_HEIGHT_PX = 128;
const HOME_HERO_PROMO_BANNER_DESKTOP_LIMITED_TOP_PX =
  HOME_HERO_PROMO_BANNER_DESKTOP_HEADLINE_TOP_PX +
  HOME_HERO_PROMO_BANNER_DESKTOP_HEADLINE_HEIGHT_PX +
  HOME_HERO_PROMO_BANNER_TEXT_DESKTOP_GAP_PX.headlineToLimited;

const HOME_HERO_PROMO_BANNER_DESKTOP_CTA_TOP_PX =
  HOME_HERO_PROMO_BANNER_DESKTOP_LIMITED_TOP_PX +
  HOME_HERO_PROMO_BANNER_DESKTOP_LIMITED_HEIGHT_PX +
  HOME_HERO_PROMO_BANNER_TEXT_DESKTOP_GAP_PX.limitedToCta;

const HOME_HERO_PROMO_BANNER_MOBILE_HEADLINE_TOP_PX = 97;
const HOME_HERO_PROMO_BANNER_MOBILE_HEADLINE_FONT_SIZE_PX = 50;
const HOME_HERO_PROMO_BANNER_MOBILE_HEADLINE_FOUNDING_LINE_HEIGHT_PX = 50;
const HOME_HERO_PROMO_BANNER_MOBILE_HEADLINE_ARE_OPEN_LINE_HEIGHT_PX = 70;
const HOME_HERO_PROMO_BANNER_MOBILE_HEADLINE_HEIGHT_PX =
  HOME_HERO_PROMO_BANNER_MOBILE_HEADLINE_FOUNDING_LINE_HEIGHT_PX * 2 +
  HOME_HERO_PROMO_BANNER_MOBILE_HEADLINE_ARE_OPEN_LINE_HEIGHT_PX;

const HOME_HERO_PROMO_BANNER_MOBILE_LIMITED_HEIGHT_PX = 102;

const HOME_HERO_PROMO_BANNER_MOBILE_LIMITED_TOP_PX =
  HOME_HERO_PROMO_BANNER_MOBILE_HEADLINE_TOP_PX +
  HOME_HERO_PROMO_BANNER_MOBILE_HEADLINE_HEIGHT_PX +
  HOME_HERO_PROMO_BANNER_MOBILE_HEADLINE_TO_LIMITED_GAP_PX;

const HOME_HERO_PROMO_BANNER_MOBILE_CTA_TOP_PX =
  HOME_HERO_PROMO_BANNER_MOBILE_LIMITED_TOP_PX +
  HOME_HERO_PROMO_BANNER_MOBILE_LIMITED_HEIGHT_PX +
  scalePromoBannerTextGapToMobileArtboard(
    HOME_HERO_PROMO_BANNER_TEXT_DESKTOP_GAP_PX.limitedToCta,
  );

export const HOME_HERO_PROMO_BANNER_TEXT_LAYOUT = {
  desktopHeadline: {
    figmaNodeIds: ["887:803", "887:804"],
    leftPx: 110,
    topPx: HOME_HERO_PROMO_BANNER_DESKTOP_HEADLINE_TOP_PX,
    heightPx: HOME_HERO_PROMO_BANNER_DESKTOP_HEADLINE_HEIGHT_PX,
    fontSizePx: HOME_HERO_PROMO_BANNER_DESKTOP_HEADLINE_FONT_SIZE_PX,
    foundingLineHeightPx: HOME_HERO_PROMO_BANNER_DESKTOP_HEADLINE_FOUNDING_LINE_HEIGHT_PX,
    areOpenLineHeightPx: HOME_HERO_PROMO_BANNER_DESKTOP_HEADLINE_ARE_OPEN_LINE_HEIGHT_PX,
  },
  desktopLimited: {
    figmaNodeId: "887:805",
    leftPx: 110,
    topPx: HOME_HERO_PROMO_BANNER_DESKTOP_LIMITED_TOP_PX,
    heightPx: HOME_HERO_PROMO_BANNER_DESKTOP_LIMITED_HEIGHT_PX,
    fontSizePx: 60,
    lineHeightPx: 64,
  },
  desktopCtaBadge: {
    figmaNodeId: "887:807",
    leftPx: 110,
    topPx: HOME_HERO_PROMO_BANNER_DESKTOP_CTA_TOP_PX,
    widthPx: 465,
    heightPx: 87,
  },
  mobileHeadline: {
    figmaNodeIds: ["882:810", "882:811"],
    leftPx: 41,
    topPx: HOME_HERO_PROMO_BANNER_MOBILE_HEADLINE_TOP_PX,
    heightPx: HOME_HERO_PROMO_BANNER_MOBILE_HEADLINE_HEIGHT_PX,
    fontSizePx: HOME_HERO_PROMO_BANNER_MOBILE_HEADLINE_FONT_SIZE_PX,
    foundingLineHeightPx: HOME_HERO_PROMO_BANNER_MOBILE_HEADLINE_FOUNDING_LINE_HEIGHT_PX,
    areOpenLineHeightPx: HOME_HERO_PROMO_BANNER_MOBILE_HEADLINE_ARE_OPEN_LINE_HEIGHT_PX,
  },
  mobileLimited: {
    figmaNodeId: "882:813",
    leftPx: 41,
    topPx: HOME_HERO_PROMO_BANNER_MOBILE_LIMITED_TOP_PX,
    widthPx: 277,
    heightPx: HOME_HERO_PROMO_BANNER_MOBILE_LIMITED_HEIGHT_PX,
    fontSizePx: 30,
    lineHeightPx: 34,
  },
  mobileCtaBadge: {
    figmaNodeId: "882:827",
    leftPx: 41,
    topPx: HOME_HERO_PROMO_BANNER_MOBILE_CTA_TOP_PX,
    widthPx: 168,
    heightPx: 36,
  },
} as const;

/** Promo CTA pill artwork — Figma `887:807` / `882:827`. */
export const HOME_HERO_PROMO_CTA_PILL = {
  widthPx: 465,
  heightPx: 87,
  aspectRatio: 465 / 87,
  /** Slightly smaller than Figma box — avoids stretched look on mobile artboard. */
  displayScale: 0.92,
} as const;

/** Studio phone on promo CTA pill — Figma `887:807` / `882:827`. */
export const HOME_HERO_PROMO_CTA_PHONE = {
  /** Full local number for `tel:` links. */
  tel: "060500400",
  /** Digits shown on the pill (full local number). */
  display: "060500400",
  color: "#795A2B",
  /** Left disc on pill PNG — number sits centered in the remaining yellow area. */
  discWidthRatio: 0.19,
  /** Digit cap height — bumped above Figma SVG (~38px on 87px). */
  fontSizeHeightRatio: 0.54,
  /** Nudge live number right on the pill (Figma artboard px). */
  offsetRightPx: 10,
} as const;

/** R2 object keys — upload via `pnpm --filter web assets:upload-marketing-videos`. */
export const HOME_HERO_INTRO_VIDEO_R2_KEY = "marketing/home/hero/home-hero-intro.webm";
export const HOME_HERO_INTRO_VIDEO_MOBILE_R2_KEY =
  "marketing/home/hero/home-hero-intro-mobile.webm";
export const HOME_HERO_INTRO_VIDEO_MOBILE_MP4_R2_KEY =
  "marketing/home/hero/home-hero-intro-mobile.mp4";
export const HOME_HERO_LOGO_MARK_VIDEO_R2_KEY = "marketing/home/hero/home-hero-logo-mark.mp4";

function normalizePublicBase(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function resolveMarketingR2AssetUrl(
  r2PublicUrl: string | undefined,
  objectKey: string,
): string | null {
  if (!r2PublicUrl || r2PublicUrl.trim().length === 0) {
    return null;
  }
  return `${normalizePublicBase(r2PublicUrl)}/${objectKey}`;
}

/** Desktop hero intro — landscape WebM on R2. */
export function resolveHomeHeroIntroVideoUrl(r2PublicUrl: string | undefined): string | null {
  return resolveMarketingR2AssetUrl(r2PublicUrl, HOME_HERO_INTRO_VIDEO_R2_KEY);
}

/** Mobile hero intro — portrait WebM on R2. */
export function resolveHomeHeroIntroMobileVideoUrl(
  r2PublicUrl: string | undefined,
): string | null {
  return resolveMarketingR2AssetUrl(r2PublicUrl, HOME_HERO_INTRO_VIDEO_MOBILE_R2_KEY);
}

/** Mobile hero intro — H.264 on R2 for iOS Safari (WebM unsupported before iOS 17.4). */
export function resolveHomeHeroIntroMobileVideoMp4Url(
  r2PublicUrl: string | undefined,
): string | null {
  return resolveMarketingR2AssetUrl(r2PublicUrl, HOME_HERO_INTRO_VIDEO_MOBILE_MP4_R2_KEY);
}

/** Legacy hero slide — ping-pong logo mark video on R2. */
export function resolveHomeHeroLogoMarkVideoUrl(
  r2PublicUrl: string | undefined,
): string | null {
  return resolveMarketingR2AssetUrl(r2PublicUrl, HOME_HERO_LOGO_MARK_VIDEO_R2_KEY);
}

export function hasHomeHeroIntroVideo(r2PublicUrl: string | undefined): boolean {
  return resolveHomeHeroIntroMobileVideoUrl(r2PublicUrl) !== null;
}

const MOBILE_CTA_WIDTH_PX = 342.48;
const MOBILE_CTA_HEIGHT_PX = 61.747;
const MOBILE_CTA_LABEL_WIDTH_PX = 268.581;
const MOBILE_CTA_ARROW_ZONE_PX = 60;

/** Figma mobile hero CTAs — full-width Union `108:6562` / `108:6572` on artboard `394`. */
export const HOME_HERO_MOBILE_CTA_LAYOUT = {
  artboardWidthPx: HOME_HERO_MOBILE_FIGMA.artboardWidthPx,
  buttonHeightPx: MOBILE_CTA_HEIGHT_PX,
  buttonGapPx: 10.25,
  /** Distance from artboard bottom to membership CTA — mobile hero only. */
  buttonsBottomOffsetPx: 0,
  buttonsBottomOffset: "0px",
  /** Nudge CTAs down on mobile — headline position unchanged. */
  buttonsDownOffsetPx: 20,
  buttonsDownOffset: "clamp(1rem, calc(100svw * 20 / 394), 1.25rem)",
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
  /** Two stacked CTAs + gap — reserves space so title never overlaps buttons. */
  buttonsBlockHeight:
    "calc(2 * clamp(3.25rem, calc(100svw * 61.747 / 394), 3.875rem) + clamp(0.5rem, calc(100svw * 10.25 / 394), 0.75rem))",
} as const;

/** Mobile section “More Details” — Featured Coaches `108:6664`, Gallery `108:6677`. */
export const HOME_HERO_MOBILE_MORE_DETAILS_CTA = {
  labelOffsetPx: 80,
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
  buttonGap: "clamp(0.625rem, calc(100svw * 16.375 * 0.88 / 1440), 0.9rem)",
  buttonsMarginTop: "clamp(0.625rem, calc(100svw * 14 / 1440), 0.875rem)",
} as const;

/** iPad Air — scaled-down hero type (744px–1023px). */
const HOME_HERO_IPAD_AIR_TYPE_SCALE = 0.9;

function scaleHeroIpadAirPx(valuePx: number): number {
  return Math.round(scaleIpadAirPx(valuePx) * HOME_HERO_IPAD_AIR_TYPE_SCALE);
}

export const HOME_HERO_IPAD_AIR_LAYOUT = {
  titleFontSizePx: scaleHeroIpadAirPx(HOME_HERO_LAYOUT.titleFontSizePx),
  titleLineHeightPx: scaleHeroIpadAirPx(HOME_HERO_LAYOUT.titleLineHeightPx),
  titleMaxWidthPx: scaleIpadAirPx(HOME_HERO_LAYOUT.titleMaxWidthPx),
  titleMarginTopPx: scaleHeroIpadAirPx(-40),
  subtitleFontSizePx: scaleHeroIpadAirPx(HOME_HERO_LAYOUT.subtitleFontSizePx),
  subtitleLineHeightPx: scaleHeroIpadAirPx(HOME_HERO_LAYOUT.subtitleLineHeightPx),
  logoMaxWidthPx: scaleIpadAirPx(HOME_HERO_LAYOUT.logoMarkWidthPx * 2.1),
  logoMarginTopPx: scaleHeroIpadAirPx(-24),
} as const;

/** iPad Pro tier — uniform scale; membership keeps native Figma proportions (1024px–1366px). */
const HOME_HERO_CTA_TABLET_SCALE = 1.28;

/** iPad Pro tier — Book / More / View Membership CTAs (1024px–1366px). */
export const HOME_HERO_CTA_TABLET_LAYOUT = {
  buttonScale: HOME_HERO_CTA_TABLET_SCALE,
  booking: {
    width: `clamp(14rem, calc(100svw * 236.625 * ${HOME_HERO_CTA_TABLET_SCALE} / 1440), 18rem)`,
    height: `clamp(3.5rem, calc(100svw * 61.136 * ${HOME_HERO_CTA_TABLET_SCALE} / 1440), 4.375rem)`,
  },
  membership: {
    width: `clamp(15rem, calc(100svw * 254.375 * ${HOME_HERO_CTA_TABLET_SCALE} / 1440), 19rem)`,
    height: `clamp(3.5rem, calc(100svw * 61 * ${HOME_HERO_CTA_TABLET_SCALE} / 1440), 4.375rem)`,
  },
  coachesDetails: {
    width: `clamp(14rem, calc(100svw * 236.625 * ${HOME_HERO_CTA_TABLET_SCALE} / 1440), 18rem)`,
    height: `clamp(3.5rem, calc(100svw * 61.136 * ${HOME_HERO_CTA_TABLET_SCALE} / 1440), 4.375rem)`,
  },
} as const;

/** Hero-only iPad Pro tier — same scale bump, slightly above sections (1024px–1366px). */
const HOME_HERO_CTA_TABLET_HERO_SCALE = 1.32;

/** Hero-only iPad Pro tier — slightly larger than section CTAs (1024px–1366px). */
export const HOME_HERO_CTA_TABLET_HERO_LAYOUT = {
  buttonScale: HOME_HERO_CTA_TABLET_HERO_SCALE,
  booking: {
    width: `clamp(14.25rem, calc(100svw * 236.625 * ${HOME_HERO_CTA_TABLET_HERO_SCALE} / 1440), 18.5rem)`,
    height: `clamp(3.625rem, calc(100svw * 61.136 * ${HOME_HERO_CTA_TABLET_HERO_SCALE} / 1440), 4.5rem)`,
  },
  membership: {
    width: `clamp(15.25rem, calc(100svw * 254.375 * ${HOME_HERO_CTA_TABLET_HERO_SCALE} / 1440), 19.5rem)`,
    height: `clamp(3.625rem, calc(100svw * 61 * ${HOME_HERO_CTA_TABLET_HERO_SCALE} / 1440), 4.5rem)`,
  },
  coachesDetails: {
    width: `clamp(14.25rem, calc(100svw * 236.625 * ${HOME_HERO_CTA_TABLET_HERO_SCALE} / 1440), 18.5rem)`,
    height: `clamp(3.625rem, calc(100svw * 61.136 * ${HOME_HERO_CTA_TABLET_HERO_SCALE} / 1440), 4.5rem)`,
  },
} as const;

/** Smaller label type for long hy/ru membership CTAs — fits pill without resizing button. */
export const HOME_HERO_CTA_MEMBERSHIP_LONG_LABEL_TYPE = {
  mobile: "clamp(0.875rem, calc(100svw * 15 / 394), 1rem)",
  desktop: "clamp(0.6875rem, calc(100svw * 11 / 1440), 0.75rem)",
  tablet: "clamp(0.75rem, calc(100svw * 12 / 1440), 0.8125rem)",
} as const;

export function isMarketingLongMembershipCtaLocale(locale: string): boolean {
  return locale === "hy" || locale === "ru";
}

/** Hero mobile layout on iPad — stacked CTAs, taller buttons (744px–1023px). */
export const HOME_HERO_CTA_TABLET_MOBILE_LAYOUT = {
  height: "clamp(4rem, calc(100svw * 61.747 * 1.28 / 394), 4.625rem)",
  labelFontSize: "clamp(1rem, calc(100svw * 16.5 / 394), 1.125rem)",
  buttonGap: "clamp(0.625rem, calc(100svw * 12 / 394), 0.875rem)",
} as const;

/** Section mobile CTAs on iPad — View Membership, More, etc. (744px–1023px). */
export const HOME_HERO_CTA_TABLET_MOBILE_SECTION_LAYOUT = {
  height: "clamp(3.875rem, calc(100svw * 61.747 * 1.22 / 394), 4.5rem)",
  labelFontSize: "clamp(1rem, calc(100svw * 16.5 / 394), 1.125rem)",
} as const;
