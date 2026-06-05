/**
 * Figma Featured Coaches — desktop section `155:188`, card `163:879`.
 * Mobile container `97:5826`, carousel `108:6737`, card `97:6075`, CTA `108:6664`.
 * Desktop portrait `-427 1` `196:1123` (342×597 in card).
 */

import { HOME_HERO_MOBILE_MORE_DETAILS_CTA } from "@/components/marketing/home/home-hero-banner-tokens";
import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";

/** Figma desktop coach portrait `196:1123` inside card `163:879`. */
export const HOME_COACHES_DESKTOP_PORTRAIT_FIGMA = {
  columnWidthPx: 342,
  columnHeightPx: 597,
  /** Card artboard reference — image column ≈ 46% of 729px card. */
  cardWidthPx: 729,
  cropWidthRatio: 1.2017,
  cropHeightRatio: 1.0334,
  cropTopRatio: -0.0328,
  objectPosition: "45% 18%",
} as const;

/** Desktop portrait layout — derived from `HOME_COACHES_DESKTOP_PORTRAIT_FIGMA`. */
export const HOME_COACHES_DESKTOP_PORTRAIT_LAYOUT = {
  imageColumnWidth: "min(21.375rem, 46%)",
  cropLeft: "calc(-4% + 6px)",
  cropTop: "3%",
  cropWidth: "114%",
  cropHeight: "98%",
  objectPosition: HOME_COACHES_DESKTOP_PORTRAIT_FIGMA.objectPosition,
} as const;

/** Shared coaches band gradient — teal → cream; top matches classes section end. */
export const HOME_COACHES_SECTION_BACKGROUND = `linear-gradient(to bottom, ${HOME_PAGE_SURFACE.classesGradientTo}, ${HOME_PAGE_SURFACE.coachesGradientTo})`;

export const HOME_COACHES_SECTION_FIGMA = {
  headingColor: "#fbf5d5",
  subtitleColor: "rgba(255, 255, 255, 0.84)",
} as const;

export const HOME_COACHES_SECTION_LAYOUT = {
  titleFontSize: "clamp(2.25rem, 5vw, 4.375rem)",
  titleLineHeight: 1.05,
  subtitleMaxWidth: "39.25rem",
  sectionPaddingTop: "calc(4rem - 55px)",
  sectionPaddingBottom: "4rem",
} as const;

/** Figma mobile Featured Coaches — container `97:5826`. */
export const HOME_COACHES_SECTION_MOBILE_FIGMA = {
  artboardWidthPx: 394,
  sectionPaddingXPx: 24,
  sectionPaddingTopPx: 64,
  sectionPaddingBottomPx: 64,
  sectionGapPx: 36,
  sectionBottomRadiusPx: 50,
  titleFontSizePx: 46,
  titleLineHeightPx: 40,
  subtitleFontSizePx: 14,
  subtitleLineHeightPx: 20,
  headerSubtitleGapPx: 16,
  carouselGapPx: 13,
  cardWidthPx: 332,
  cardHeightPx: 472,
  cardRadiusPx: 24,
  cardPaddingPx: 27,
  cardNameFontSizePx: 30,
  cardNameLineHeightPx: 36,
  /** Smaller type when the display name exceeds {@link cardNameLongThresholdChars}. */
  cardNameLongFontSizePx: 24,
  cardNameLongLineHeightPx: 28,
  cardNameLongThresholdChars: 16,
  cardBodyFontSizePx: 14,
  cardBodyLineHeightPx: 20,
  cardNavSizePx: 64,
  sectionDotSizePx: 6,
  sectionDotGapPx: 6,
} as const;

/** Mobile layout from Figma `97:5826`. */
export const HOME_COACHES_SECTION_MOBILE_LAYOUT = {
  sectionPaddingX: "1.5rem",
  sectionPaddingTop: "4rem",
  sectionPaddingBottom: "2.5rem",
  sectionGap: "2.25rem",
  sectionBottomRadius: "3.125rem",
  titleFontSize: "clamp(2.25rem, calc(100svw * 46 / 394), 2.875rem)",
  titleLineHeight:
    HOME_COACHES_SECTION_MOBILE_FIGMA.titleLineHeightPx / HOME_COACHES_SECTION_MOBILE_FIGMA.titleFontSizePx,
  subtitleFontSize: "clamp(0.8125rem, calc(100svw * 14 / 394), 0.875rem)",
  subtitleLineHeight:
    HOME_COACHES_SECTION_MOBILE_FIGMA.subtitleLineHeightPx / HOME_COACHES_SECTION_MOBILE_FIGMA.subtitleFontSizePx,
  subtitleMaxWidth: "100%",
  headerSubtitleGap: "1rem",
  carouselGap: "0.8125rem",
  carouselGapRem: 13 / 16,
  carouselCardWidth: "clamp(20.75rem, calc(100svw * 332 / 394), 20.75rem)",
  carouselCardHeight: "29.5rem",
  cardRadiusPx: HOME_COACHES_SECTION_MOBILE_FIGMA.cardRadiusPx,
  cardMinHeightPx: HOME_COACHES_SECTION_MOBILE_FIGMA.cardHeightPx,
  cardNavSizePx: HOME_COACHES_SECTION_MOBILE_FIGMA.cardNavSizePx,
  sectionDotSize: "0.375rem",
  sectionDotGap: "0.375rem",
  sectionDotActiveScale: 1.1,
  /** Mobile “More Details” — label nudged right vs booking default (67px). */
  ctaLabelOffsetPx: HOME_HERO_MOBILE_MORE_DETAILS_CTA.labelOffsetPx,
} as const;

/** True when the coach name should use compact mobile card typography. */
export function isLongCoachCardName(name: string): boolean {
  return name.trim().length > HOME_COACHES_SECTION_MOBILE_FIGMA.cardNameLongThresholdChars;
}

export const HOME_COACHES_CAROUSEL_DESKTOP_GAP_REM = 2.25 as const;
