/**
 * Figma **Gallery** `196:1162` — mosaic `196:1163`, nav `196:1168`, dots `196:1175`, CTA `196:1179`, heading `196:1187`.
 * Mobile container `97:5853`.
 */

import { HOME_FOOTER_TABLET_LAYOUT } from "@/components/marketing/home/home-footer-section-tokens";
import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";
import { scaleIpadAirPx } from "@/lib/viewport-breakpoints";

const HOME_GALLERY_GRADIENT_CREAM = HOME_PAGE_SURFACE.coachesGradientTo;
const HOME_GALLERY_GRADIENT_TEAL = HOME_PAGE_SURFACE.eventsGradientFrom;

/** Smooth cream → teal ramp (gallery section only). */
const HOME_GALLERY_GRADIENT_BLEND = {
  soft: "#dce6ea",
  mid: "#c5d8de",
  teal: "#94acb6",
  deep: "#729aa8",
} as const;

/** Figma mobile gallery — container `97:5853`. */
export const HOME_GALLERY_SECTION_MOBILE_FIGMA = {
  artboardWidthPx: 394,
  sectionPaddingXPx: 24,
  sectionPaddingTopPx: 64,
  sectionPaddingBottomPx: 64,
  sectionTopRadiusPx: 40,
  sectionGapPx: 36,
  headerMaxWidthPx: 346,
  titleFontSizePx: 36,
  titleLineHeightPx: 40,
  titleLineGapPx: 26,
  subtitleFontSizePx: 14,
  subtitleLineHeightPx: 20,
  headerSubtitleGapPx: 24,
  mosaicSizePx: 346,
  mosaicGapPx: 16,
  tileRadiusPx: 16,
  leftTileWidthPx: 165,
  rightTileSizePx: 165,
  mosaicToDotsGapPx: 39,
  dotsToCtaGapPx: 32,
  dotSizePx: 9,
  dotGapPx: 8,
  headingColor: "#fbf5d5",
  subtitleColor: "rgba(255, 255, 255, 0.84)",
  dotActive: "#fbf5d5",
  dotInactive: "rgba(251, 245, 213, 0.4)",
} as const;

/** Teal → cream ramp — Figma `97:5853` background stops. */
export const HOME_GALLERY_MOBILE_BACKGROUND = `linear-gradient(to bottom, #598090 0%, #637b95 7.14%, #6e8e9b 14.29%, #7896a0 21.43%, #829da6 28.57%, #8da5ab 35.71%, #97acb1 42.86%, #a2b3b6 50%, #acbbbc 57.14%, #b7c3c1 64.29%, #c2cac8 71.43%, #ccd2cc 78.57%, #d7d9d2 85.71%, #e2e1d7 92.86%, ${HOME_GALLERY_GRADIENT_CREAM} 100%)`;

/** Bottom stop — continues under the mobile footer cap. */
export const HOME_GALLERY_MOBILE_GRADIENT_END = HOME_GALLERY_GRADIENT_CREAM;

/** Mobile layout from Figma `97:5853`. */
export const HOME_GALLERY_SECTION_MOBILE_LAYOUT = {
  sectionPaddingX: "1.5rem",
  sectionPaddingTop: "4rem",
  sectionPaddingBottom: "4rem",
  sectionTopRadius: "2.5rem",
  sectionGap: "2.25rem",
  headerMaxWidth: "clamp(17rem, calc(100svw * 346 / 394), 21.625rem)",
  titleFontSize: "clamp(2rem, calc(100svw * 36 / 394), 2.25rem)",
  titleLineHeight:
    HOME_GALLERY_SECTION_MOBILE_FIGMA.titleLineHeightPx / HOME_GALLERY_SECTION_MOBILE_FIGMA.titleFontSizePx,
  titleLineGap: "clamp(1rem, calc(100svw * 26 / 394), 1.5rem)",
  subtitleFontSize: "clamp(0.8125rem, calc(100svw * 14 / 394), 0.875rem)",
  subtitleLineHeight:
    HOME_GALLERY_SECTION_MOBILE_FIGMA.subtitleLineHeightPx / HOME_GALLERY_SECTION_MOBILE_FIGMA.subtitleFontSizePx,
  headerSubtitleGap: "1.5rem",
  mosaicSize: "clamp(17rem, calc(100svw * 346 / 394), 21.625rem)",
  mosaicGap: "1rem",
  carouselGap: "1rem",
  mosaicToDotsGap: "2.4375rem",
  dotsToCtaGap: "2rem",
  tileRadiusPx: HOME_GALLERY_SECTION_MOBILE_FIGMA.tileRadiusPx,
} as const;

export const HOME_GALLERY_FIGMA = {
  gradientFrom: HOME_PAGE_SURFACE.eventsGradientFrom,
  gradientTo: HOME_PAGE_SURFACE.eventsGradientTo,
  /** Cream heading band; long smooth ramp to teal before the mosaic cards. */
  sectionBackground: `linear-gradient(to bottom, ${HOME_GALLERY_GRADIENT_CREAM} 0%, ${HOME_GALLERY_GRADIENT_CREAM} 8%, ${HOME_GALLERY_GRADIENT_BLEND.soft} 14%, ${HOME_GALLERY_GRADIENT_BLEND.mid} 22%, ${HOME_GALLERY_GRADIENT_BLEND.teal} 30%, ${HOME_GALLERY_GRADIENT_BLEND.deep} 36%, ${HOME_GALLERY_GRADIENT_TEAL} 42%, ${HOME_GALLERY_GRADIENT_TEAL} 100%)`,
  headingColor: HOME_PAGE_SURFACE.plansHeading,
  subtitleColor: "rgba(98, 98, 98, 0.84)",
  dotInactive: "rgba(255, 255, 255, 0.38)",
  dotActive: "#fbf5d5",
  tileRadiusPx: 15,
} as const;

export const HOME_GALLERY_LAYOUT = {
  contentMaxWidthPx: 1326,
  sectionPaddingTop: "clamp(3.5rem, 6vw, 5.5rem)",
  sectionPaddingBottom: "clamp(1.5rem, 4vw, 3.5rem)",
  headerGapPx: 41,
  headerToMosaicGapPx: 60,
  mosaicToDotsGapPx: 63,
  dotsToCtaGapPx: 72,
  titleFontSize: "clamp(2.25rem, 5vw, 4.375rem)",
  titleLineHeight: 48 / 70,
  titleLineGap: "clamp(1.125rem, calc(100svw * 32 / 1440), 1.75rem)",
  subtitleMaxWidth: "39.25rem",
  mosaicGapPx: 36,
  navButtonSizePx: 64,
  /** Nudge prev/next controls slightly below mosaic vertical center (Figma alignment). */
  navVerticalOffsetPx: 12,
  dotSizePx: 12,
  dotGapPx: 17,
} as const;

/** iPad Air — gallery heading + carousel controls (744px–1023px). */
export const HOME_GALLERY_IPAD_AIR_LAYOUT = {
  titleFontSize: "clamp(1.875rem, 4.2vw, 3.25rem)",
  titleLineHeight: 40 / 56,
  subtitleFontSize: "0.9375rem",
  navButtonSizePx: scaleIpadAirPx(HOME_GALLERY_LAYOUT.navButtonSizePx),
  dotSizePx: scaleIpadAirPx(HOME_GALLERY_LAYOUT.dotSizePx),
  dotGapPx: scaleIpadAirPx(HOME_GALLERY_LAYOUT.dotGapPx),
  mosaicToDotsGapPx: scaleIpadAirPx(HOME_GALLERY_LAYOUT.mosaicToDotsGapPx),
} as const;

/** iPad Air + Pro — gallery carousel arrows (744px–1366px). */
export const HOME_GALLERY_TABLET_NAV_LAYOUT = {
  buttonEdgeInsetPx: 6,
  /** Default desktop outward offset is 38%. */
  buttonOutwardTranslatePercent: 32,
} as const;

/** iPad Air + Pro — teal gallery band matches footer overlap (744px–1366px). */
export const HOME_GALLERY_TABLET_LAYOUT = {
  footerUnderlap: HOME_FOOTER_TABLET_LAYOUT.galleryOverlap,
  footerUnderlapBackground: HOME_GALLERY_GRADIENT_TEAL,
} as const;

export type HomeGalleryTileKey = "leftTop" | "leftBottom" | "center" | "side";

export type HomeGallerySlide = {
  id: string;
  tiles: Record<HomeGalleryTileKey, { src: string }>;
};

/** Shared left/right tiles — stable across slides. */
const HOME_GALLERY_DESKTOP_SIDE_TILES = {
  leftTop: { src: HOME_SECTION_ASSETS.galleryVipMain },
  leftBottom: { src: HOME_SECTION_ASSETS.galleryCafe },
  side: { src: HOME_SECTION_ASSETS.galleryVipSide },
} as const satisfies Pick<HomeGallerySlide["tiles"], "leftTop" | "leftBottom" | "side">;

/** Four tiles — 2 stacked left, tall center, tall narrow right. Center varies per slide. */
export const HOME_GALLERY_SLIDES: readonly HomeGallerySlide[] = [
  {
    id: "studio-arches",
    tiles: {
      ...HOME_GALLERY_DESKTOP_SIDE_TILES,
      center: { src: HOME_SECTION_ASSETS.galleryVipMain },
    },
  },
  {
    id: "reception-lounge",
    tiles: {
      ...HOME_GALLERY_DESKTOP_SIDE_TILES,
      center: { src: HOME_SECTION_ASSETS.galleryCafe },
    },
  },
  {
    id: "reformers-hall",
    tiles: {
      ...HOME_GALLERY_DESKTOP_SIDE_TILES,
      center: { src: HOME_SECTION_ASSETS.galleryVipSide },
    },
  },
] as const;

export type HomeGalleryMobileTileKey = "left" | "rightTop" | "rightBottom";

export type HomeGalleryMobileSlide = {
  id: string;
  tiles: Record<HomeGalleryMobileTileKey, { src: string }>;
};

/** Shared mobile tiles — portrait left, square bottom-right; top-right varies per slide. */
const HOME_GALLERY_MOBILE_SIDE_TILES = {
  left: { src: HOME_SECTION_ASSETS.galleryVipSide },
  rightBottom: { src: HOME_SECTION_ASSETS.galleryCafe },
} as const satisfies Pick<HomeGalleryMobileSlide["tiles"], "left" | "rightBottom">;

/** Three-tile mosaic — Figma mobile `97:5865`. Tall left + square right tiles. */
export const HOME_GALLERY_MOBILE_SLIDES: readonly HomeGalleryMobileSlide[] = [
  {
    id: "studio-arches",
    tiles: {
      ...HOME_GALLERY_MOBILE_SIDE_TILES,
      rightTop: { src: HOME_SECTION_ASSETS.galleryVipMain },
    },
  },
  {
    id: "reception-lounge",
    tiles: {
      ...HOME_GALLERY_MOBILE_SIDE_TILES,
      rightTop: { src: HOME_SECTION_ASSETS.galleryVipMain },
    },
  },
  {
    id: "reformers-hall",
    tiles: {
      ...HOME_GALLERY_MOBILE_SIDE_TILES,
      rightTop: { src: HOME_SECTION_ASSETS.galleryCafe },
    },
  },
] as const;
