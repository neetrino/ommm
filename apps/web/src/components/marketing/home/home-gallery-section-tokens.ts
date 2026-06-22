/**
 * Figma **Gallery** `605:932` (desktop), legacy `196:1162`.
 * Mobile container `97:5853`.
 */

import { HOME_FOOTER_TABLET_LAYOUT } from "@/components/marketing/home/home-footer-section-tokens";
import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";
import { scaleIpadAirPx } from "@/lib/viewport-breakpoints";

/** Figma `605:932` — solid page cream (`#fbf5d5`). */
export const HOME_GALLERY_SECTION_BACKGROUND = HOME_PAGE_SURFACE.pageBackground;

/** Figma `605:932` — olive heading on cream band. */
const HOME_GALLERY_HEADING_COLOR = HOME_PAGE_SURFACE.classesGradientFrom;

/** Figma `605:932` — muted body on cream. */
const HOME_GALLERY_SUBTITLE_COLOR = "rgba(98, 98, 98, 0.84)";

/** Carousel dots on cream — olive active, muted idle. */
const HOME_GALLERY_DOT_ACTIVE = HOME_GALLERY_HEADING_COLOR;
const HOME_GALLERY_DOT_INACTIVE = "rgba(151, 144, 124, 0.35)";

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
  headingColor: HOME_GALLERY_HEADING_COLOR,
  subtitleColor: HOME_GALLERY_SUBTITLE_COLOR,
  dotActive: HOME_GALLERY_DOT_ACTIVE,
  dotInactive: HOME_GALLERY_DOT_INACTIVE,
} as const;

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
  gradientFrom: HOME_PAGE_SURFACE.pageBackground,
  gradientTo: HOME_PAGE_SURFACE.pageBackground,
  sectionBackground: HOME_GALLERY_SECTION_BACKGROUND,
  headingColor: HOME_GALLERY_HEADING_COLOR,
  subtitleColor: HOME_GALLERY_SUBTITLE_COLOR,
  dotInactive: HOME_GALLERY_DOT_INACTIVE,
  dotActive: HOME_GALLERY_DOT_ACTIVE,
  tileRadiusPx: 15,
} as const;

export const HOME_GALLERY_LAYOUT = {
  contentMaxWidthPx: 1326,
  sectionPaddingTop: "clamp(3.5rem, 6vw, 5.5rem)",
  sectionPaddingBottom: "clamp(2rem, 5vw, 4rem)",
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

/** iPad Air + Pro — cream gallery band matches footer overlap (744px–1366px). */
export const HOME_GALLERY_TABLET_LAYOUT = {
  footerUnderlap: HOME_FOOTER_TABLET_LAYOUT.galleryOverlap,
  footerUnderlapBackground: HOME_GALLERY_SECTION_BACKGROUND,
} as const;

/** Desktop peek carousel — center slide full width, neighbours half visible. */
export const HOME_GALLERY_CAROUSEL = {
  /** Each slide occupies 50% of the viewport so adjacent slides peek by half. */
  slideWidthRatio: 0.5,
  gapPx: 28,
  transformMs: 560,
  autoAdvanceMs: 6000,
  slideAspectRatio: "613 / 613",
  /** Prev/next sit flush to the viewport edges of the full-bleed track. */
  navEdgeInsetPx: 24,
} as const;

export type HomeGalleryCarouselSlide = {
  id: string;
  src: string;
};

/** One photo per slide — centered peek carousel on desktop. */
export const HOME_GALLERY_SLIDES: readonly HomeGalleryCarouselSlide[] = [
  { id: "studio-arches", src: HOME_SECTION_ASSETS.galleryVipMain },
  { id: "reception-lounge", src: HOME_SECTION_ASSETS.galleryCafe },
  { id: "reformers-hall", src: HOME_SECTION_ASSETS.galleryVipSide },
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
