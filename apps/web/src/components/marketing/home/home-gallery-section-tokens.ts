/**
 * Figma **Gallery** `196:1162` — mosaic `196:1163`, nav `196:1168`, dots `196:1175`, CTA `196:1179`, heading `196:1187`.
 */

import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";

const HOME_GALLERY_GRADIENT_CREAM = HOME_PAGE_SURFACE.coachesGradientTo;
const HOME_GALLERY_GRADIENT_TEAL = HOME_PAGE_SURFACE.eventsGradientFrom;

/** Smooth cream → teal ramp (gallery section only). */
const HOME_GALLERY_GRADIENT_BLEND = {
  soft: "#dce6ea",
  mid: "#c5d8de",
  teal: "#94acb6",
  deep: "#729aa8",
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
  mosaicToDotsGapPx: 56,
  dotsToCtaGapPx: 72,
  titleFontSize: "clamp(2.25rem, 5vw, 4.375rem)",
  titleLineHeight: 48 / 70,
  subtitleMaxWidth: "39.25rem",
  mosaicGapPx: 36,
  navButtonSizePx: 64,
  dotSizePx: 12,
  dotGapPx: 17,
} as const;

export type HomeGalleryTileKey = "leftTop" | "leftBottom" | "center" | "side";

export type HomeGallerySlide = {
  id: string;
  tiles: Record<HomeGalleryTileKey, { src: string }>;
};

/** Four tiles — 2 stacked left, tall center, tall narrow right. */
export const HOME_GALLERY_SLIDES: readonly HomeGallerySlide[] = [
  {
    id: "studio-arches",
    tiles: {
      leftTop: { src: HOME_SECTION_ASSETS.galleryVipMain },
      leftBottom: { src: HOME_SECTION_ASSETS.galleryCafe },
      center: { src: HOME_SECTION_ASSETS.galleryVipMain },
      side: { src: HOME_SECTION_ASSETS.galleryVipSide },
    },
  },
  {
    id: "reception-lounge",
    tiles: {
      leftTop: { src: HOME_SECTION_ASSETS.galleryVipMain },
      leftBottom: { src: HOME_SECTION_ASSETS.galleryCafe },
      center: { src: HOME_SECTION_ASSETS.galleryVipSide },
      side: { src: HOME_SECTION_ASSETS.galleryCafe },
    },
  },
  {
    id: "reformers-hall",
    tiles: {
      leftTop: { src: HOME_SECTION_ASSETS.galleryVipSide },
      leftBottom: { src: HOME_SECTION_ASSETS.galleryVipMain },
      center: { src: HOME_SECTION_ASSETS.galleryCafe },
      side: { src: HOME_SECTION_ASSETS.galleryVipMain },
    },
  },
] as const;
