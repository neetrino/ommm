/**
 * Figma **Classes Section** `605:844` (desktop), legacy `196:1074`.
 * Mobile container `97:5683`, carousel `97:6025`, card `97:6043`.
 */

import { scaleIpadAirPx } from "@/lib/viewport-breakpoints";
import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";
import {
  HOME_WEEKLY_SCHEDULE_MOBILE_FIGMA,
  HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT,
} from "@/components/marketing/home/home-weekly-schedule-tokens";

/** Figma `605:844` — olive → cream page surface. */
export const HOME_CLASSES_SECTION_BACKGROUND = `linear-gradient(to bottom, ${HOME_PAGE_SURFACE.classesGradientFrom}, ${HOME_PAGE_SURFACE.classesGradientTo})`;

export const HOME_CLASSES_SECTION_FIGMA = {
  gradientFrom: HOME_PAGE_SURFACE.classesGradientFrom,
  gradientTo: HOME_PAGE_SURFACE.classesGradientTo,
  headingColor: "#fbf5d5",
  subtitleColor: "rgba(255, 255, 255, 0.84)",
  cardTitleColor: HOME_PAGE_SURFACE.cardTitle,
  cardBodyColor: HOME_PAGE_SURFACE.cardBody,
  cardRadiusPx: HOME_PAGE_SURFACE.classCardRadiusPx,
  cardBorder: "rgba(232, 218, 116, 0.1)",
  cardMinHeightPx: 327,
} as const;

export const HOME_CLASSES_SECTION_LAYOUT = {
  titleFontSize: "clamp(2.25rem, 5vw, 4.375rem)",
  titleLineHeight: 1.1,
  subtitleMaxWidth: "39.25rem",
  contentMaxWidthPx: 1280,
  sectionPaddingY: "clamp(4rem, 10vw, 10.875rem)",
  gridGap: "clamp(1.5rem, 2vw, 2rem)",
} as const;

/** Figma mobile Our Core Practices — container `97:5683`, carousel `97:6025`, card `97:6043`. */
export const HOME_CLASSES_SECTION_MOBILE_FIGMA = {
  artboardWidthPx: 394,
  sectionPaddingXPx: 24,
  sectionPaddingYPx: 64,
  sectionGapPx: 36,
  titleFontSizePx: 46,
  titleLineHeightPx: 44,
  subtitleFontSizePx: 16,
  subtitleLineHeightPx: 24,
  headerSubtitleGapPx: 16,
  cardWidthPx: 260,
  cardHeightPx: 419,
  cardPaddingPx: 24,
  cardRadiusPx: 24,
  cardGapPx: 20,
  cardTitleFontSizePx: 22,
  cardTitleLineHeightPx: 28,
  cardBodyFontSizePx: 12,
  cardBodyLineHeightPx: 17,
  cardImageRotationDeg: 8.8,
} as const;

const mobileClassesCornerCoverPx = HOME_WEEKLY_SCHEDULE_MOBILE_FIGMA.panelRadiusPx + 12;

/** Mobile layout from Figma `97:5683`. */
export const HOME_CLASSES_SECTION_MOBILE_LAYOUT = {
  sectionPaddingX: "1.5rem",
  sectionPaddingY: "4rem",
  sectionGap: "2.25rem",
  titleFontSize: "clamp(2.25rem, calc(100svw * 46 / 394), 2.875rem)",
  titleLineHeight: HOME_CLASSES_SECTION_MOBILE_FIGMA.titleLineHeightPx / HOME_CLASSES_SECTION_MOBILE_FIGMA.titleFontSizePx,
  subtitleFontSize: "clamp(0.875rem, calc(100svw * 16 / 394), 1rem)",
  subtitleLineHeight:
    HOME_CLASSES_SECTION_MOBILE_FIGMA.subtitleLineHeightPx / HOME_CLASSES_SECTION_MOBILE_FIGMA.subtitleFontSizePx,
  subtitleMaxWidth: "100%",
  headerSubtitleGap: "1rem",
  carouselCardWidth: "clamp(16.25rem, calc(100svw * 260 / 394), 16.25rem)",
  carouselCardHeight: "26.1875rem",
  carouselGap: "1.25rem",
  carouselHeight: "26.1875rem",
  cardMinHeightPx: HOME_CLASSES_SECTION_MOBILE_FIGMA.cardHeightPx,
  cardRadiusPx: HOME_CLASSES_SECTION_MOBILE_FIGMA.cardRadiusPx,
  /** Pull gradient through weekly schedule bottom corners on mobile. */
  sectionClassesOverlap: `calc(${HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionOuterPaddingBottom} + ${mobileClassesCornerCoverPx}px)`,
  sectionToClassesHeadingGapAdjustPx: -15,
} as const;

/** Per-card copy colors for dark-background practice cards. */
export const HOME_CLASS_CARD_LIGHT_COPY = {
  title: "#ffffff",
  body: "rgba(255, 255, 255, 0.85)",
} as const;

export type HomeClassCardVisual = {
  id: string;
  background: string;
  bordered: boolean;
  imageSrc: string;
  imageVariant: "default" | "wide" | "flipY" | "fullBleed";
  titleColor?: string;
  bodyColor?: string;
};

/** Figma card order — row 1: cards 1–3, row 2: cards 4–5 (offset grid). */
export const HOME_CLASS_CARD_VISUALS: readonly HomeClassCardVisual[] = [
  {
    id: "reformer-pilates",
    background: "#3a3f44",
    bordered: false,
    imageSrc: HOME_SECTION_ASSETS.classReformerPilates,
    imageVariant: "fullBleed",
    titleColor: HOME_CLASS_CARD_LIGHT_COPY.title,
    bodyColor: HOME_CLASS_CARD_LIGHT_COPY.body,
  },
  {
    id: "mat-pilates",
    background: "#6b4a3a",
    bordered: false,
    imageSrc: HOME_SECTION_ASSETS.classMatPilates,
    imageVariant: "fullBleed",
    titleColor: HOME_CLASS_CARD_LIGHT_COPY.title,
    bodyColor: HOME_CLASS_CARD_LIGHT_COPY.body,
  },
  {
    id: "power-pilates",
    background: "#f0e6cc",
    bordered: false,
    imageSrc: HOME_SECTION_ASSETS.classPowerPilates,
    imageVariant: "fullBleed",
  },
  {
    id: "yoga",
    background: "#e5e0d5",
    bordered: false,
    imageSrc: HOME_SECTION_ASSETS.classYoga,
    imageVariant: "fullBleed",
  },
  {
    id: "stretching",
    background: "#f5e9d0",
    bordered: false,
    imageSrc: HOME_SECTION_ASSETS.classStretching,
    imageVariant: "fullBleed",
  },
] as const;

/** 12-column desktop — row 1: three `col-span-4`; row 2: two cards centered. */
export const HOME_CLASS_CARD_GRID_CLASS =
  "col-span-1 tablet:col-span-6 nav-desktop:col-span-4";

/** iPad Air + Pro (tablet–nav-desktop): 2×2 grid + 5th card centered; full desktop offsets above 1366px. */
export const HOME_CLASS_CARD_GRID_OFFSETS = [
  "",
  "",
  "",
  "nav-desktop:col-start-3",
  "tablet:col-start-4 nav-desktop:col-start-7",
] as const;

/** iPad Air + Pro tier — 2-column grid; compact vertical footprint (744px–1366px). */
export const HOME_CLASSES_SECTION_TABLET_LAYOUT = {
  cardMinHeightPx: 300,
  cardTitleFontSizePx: 22,
  cardTitleLineHeightPx: 28,
  cardBodyFontSizePx: 12,
  cardBodyLineHeightPx: 17,
  gridGap: "1.5rem",
  contentMaxWidthPx: 920,
} as const;

/** iPad Air — scaled-down Pro tier (744px–1023px). */
export const HOME_CLASSES_SECTION_IPAD_AIR_LAYOUT = {
  cardMinHeightPx: scaleIpadAirPx(HOME_CLASSES_SECTION_TABLET_LAYOUT.cardMinHeightPx),
  cardTitleFontSizePx: scaleIpadAirPx(HOME_CLASSES_SECTION_TABLET_LAYOUT.cardTitleFontSizePx),
  cardTitleLineHeightPx: scaleIpadAirPx(HOME_CLASSES_SECTION_TABLET_LAYOUT.cardTitleLineHeightPx),
  cardBodyFontSizePx: scaleIpadAirPx(HOME_CLASSES_SECTION_TABLET_LAYOUT.cardBodyFontSizePx),
  cardBodyLineHeightPx: scaleIpadAirPx(HOME_CLASSES_SECTION_TABLET_LAYOUT.cardBodyLineHeightPx),
  gridGap: "1.25rem",
  contentMaxWidthPx: scaleIpadAirPx(HOME_CLASSES_SECTION_TABLET_LAYOUT.contentMaxWidthPx),
} as const;
