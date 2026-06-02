/**
 * Figma **Classes Section** `196:1074` — gradient, cards `196:1082`–`196:1106`, CTA `196:1113`.
 * Mobile container `97:5683`, carousel `97:6025`, card `97:6043`.
 */

import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";
import {
  HOME_WEEKLY_SCHEDULE_MOBILE_FIGMA,
  HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT,
} from "@/components/marketing/home/home-weekly-schedule-tokens";

/** Shared with weekly schedule outer bands — olive → teal (`196:1074`). */
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
  subtitleFontSizePx: 14,
  subtitleLineHeightPx: 20,
  headerSubtitleGapPx: 16,
  cardWidthPx: 260,
  cardHeightPx: 419,
  cardPaddingPx: 24,
  cardRadiusPx: 24,
  cardGapPx: 20,
  cardTitleFontSizePx: 24,
  cardTitleLineHeightPx: 32,
  cardBodyFontSizePx: 14,
  cardBodyLineHeightPx: 20,
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
  subtitleFontSize: "clamp(0.8125rem, calc(100svw * 14 / 394), 0.875rem)",
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
  cardImageRotationDeg: HOME_CLASSES_SECTION_MOBILE_FIGMA.cardImageRotationDeg,
  /** Pull gradient through weekly schedule bottom corners on mobile. */
  sectionClassesOverlap: `calc(${HOME_WEEKLY_SCHEDULE_MOBILE_LAYOUT.sectionOuterPaddingBottom} + ${mobileClassesCornerCoverPx}px)`,
  sectionToClassesHeadingGapAdjustPx: -15,
} as const;

export type HomeClassCardVisual = {
  id: string;
  background: string;
  bordered: boolean;
  imageSrc: string;
  imageVariant: "default" | "wide" | "flipY";
};

/** Figma card order — row 1: cards 1–3, row 2: cards 4–5 (offset grid). */
export const HOME_CLASS_CARD_VISUALS: readonly HomeClassCardVisual[] = [
  {
    id: "reformer-group",
    background: "#e5f4f9",
    bordered: false,
    imageSrc: HOME_SECTION_ASSETS.classReformerGroup,
    imageVariant: "default",
  },
  {
    id: "reformer-individual",
    background: "#ede9dd",
    bordered: false,
    imageSrc: HOME_SECTION_ASSETS.classReformerIndividual,
    imageVariant: "wide",
  },
  {
    id: "yoga",
    background: "#f6d0bd",
    bordered: true,
    imageSrc: HOME_SECTION_ASSETS.classYoga,
    imageVariant: "flipY",
  },
  {
    id: "mat-pilates",
    background: "#bbd2da",
    bordered: false,
    imageSrc: HOME_SECTION_ASSETS.classMatPilates,
    imageVariant: "wide",
  },
  {
    id: "dances",
    background: "#cbc2b4",
    bordered: false,
    imageSrc: HOME_SECTION_ASSETS.classDances,
    imageVariant: "default",
  },
] as const;

/** 12-column desktop — row 1: three `col-span-4`; row 2: two cards centered with the same inter-card gap. */
export const HOME_CLASS_CARD_GRID_CLASS =
  "col-span-1 lg:col-span-4";

export const HOME_CLASS_CARD_GRID_OFFSETS = [
  "lg:col-start-auto",
  "lg:col-start-auto",
  "lg:col-start-auto",
  "lg:col-start-3",
  "lg:col-start-7",
] as const;
