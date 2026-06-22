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

/** Card 3 (yoga) — desktop photo nudge down. */
export const HOME_CLASS_CARD_YOGA_IMAGE_OFFSET_DESKTOP_PX = 20;

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
  /** Card 2 — upright portrait; no carousel tilt. */
  uprightCardImageRotationDeg: 0,
  /** Card 3 — rotated on mobile carousel. */
  yogaMobileImageRotationDeg: 360,
  /** Card 3 — nudge photo up in the image zone. */
  yogaMobileImageOffsetUpPx: 16,
  /** Card 4 — nudge photo up in the image zone. */
  matPilatesMobileImageOffsetUpPx: 16,
} as const;

/** Mobile carousel cards whose photo sits upright (no 8.8° tilt). */
export const HOME_CLASS_CARD_MOBILE_UPRIGHT_IDS = ["reformer-individual"] as const;

/** Resolves per-card mobile image rotation for Our Core Practices carousel. */
export function homeClassCardMobileImageRotationDeg(cardId: string): number {
  if (cardId === "yoga") {
    return HOME_CLASSES_SECTION_MOBILE_FIGMA.yogaMobileImageRotationDeg;
  }
  if ((HOME_CLASS_CARD_MOBILE_UPRIGHT_IDS as readonly string[]).includes(cardId)) {
    return HOME_CLASSES_SECTION_MOBILE_FIGMA.uprightCardImageRotationDeg;
  }
  return HOME_CLASSES_SECTION_MOBILE_FIGMA.cardImageRotationDeg;
}

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
  cardImageRotationDeg: HOME_CLASSES_SECTION_MOBILE_FIGMA.cardImageRotationDeg,
  uprightCardImageRotationDeg: HOME_CLASSES_SECTION_MOBILE_FIGMA.uprightCardImageRotationDeg,
  yogaMobileImageRotationDeg: HOME_CLASSES_SECTION_MOBILE_FIGMA.yogaMobileImageRotationDeg,
  yogaMobileImageOffsetUpPx: HOME_CLASSES_SECTION_MOBILE_FIGMA.yogaMobileImageOffsetUpPx,
  matPilatesMobileImageOffsetUpPx: HOME_CLASSES_SECTION_MOBILE_FIGMA.matPilatesMobileImageOffsetUpPx,
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
    id: "mat-pilates",
    background: "#bbd2da",
    bordered: false,
    imageSrc: HOME_SECTION_ASSETS.classMatPilates,
    imageVariant: "wide",
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
    id: "dances",
    background: "#cbc2b4",
    bordered: false,
    imageSrc: HOME_SECTION_ASSETS.classDances,
    imageVariant: "default",
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
