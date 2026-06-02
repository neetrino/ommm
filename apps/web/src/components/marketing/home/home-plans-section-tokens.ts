/**
 * Figma **Packages** `196:1251` — frosted panel, heading `196:1252`, cards `196:1256`, CTA `196:1260`.
 * Mobile container `97:5888`, carousel `104:6141`, card `104:6142`, CTA `108:6677`.
 */

import { HOME_HERO_FIGMA } from "@/components/marketing/home/home-hero-banner-tokens";
import { HOME_COACHES_SECTION_MOBILE_LAYOUT } from "@/components/marketing/home/home-coaches-section-tokens";
import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";

/** Figma mobile Packages — container `97:5888`. */
export const HOME_PLANS_SECTION_MOBILE_FIGMA = {
  artboardWidthPx: 394,
  sectionPaddingXPx: 24,
  sectionPaddingYPx: 48,
  sectionGapPx: 36,
  sectionRadiusPx: 40,
  headerMaxWidthPx: 314,
  titleFontSizePx: 46,
  titleLineHeightPx: 43,
  subtitleFontSizePx: 14,
  subtitleLineHeightPx: 20,
  headerSubtitleGapPx: 24,
  carouselGapPx: 27,
  carouselHeightPx: 474,
  cardWidthPx: 292,
  cardHeightPx: 440,
  cardRadiusPx: 40,
  cardImageFrameLeftPx: 2,
  cardImageFrameTopPx: 0.96,
  cardImageFrameWidthPx: 290,
  cardImageFrameHeightPx: 439,
  cardImageCropLeftPercent: -7.59,
  cardImageCropTopPercent: 0.07,
  cardImageCropWidthPercent: 115.17,
  cardImageCropHeightPercent: 100.04,
  glassWidthPx: 291,
  glassHeightPx: 136,
  glassOverhangPx: 34,
  /** Lifts price panel slightly above card bottom edge. */
  glassBottomInsetPx: 20,
  glassPaddingRightPx: 12,
  glassPaddingLeftPx: 20,
  categoryLeftPx: 54,
  categoryTopPx: 55.58,
  categoryFontSizePx: 28,
  categoryLineHeightPx: 24,
  detailsFontSizePx: 18,
  detailsLineHeightPx: 24,
  priceFontSizePx: 28,
  priceLineHeightPx: 24,
  letterSpacingPx: 0.18,
  ctaIconSizePx: 64,
} as const;

/** Mobile layout from Figma `97:5888`. */
export const HOME_PLANS_SECTION_MOBILE_LAYOUT = {
  sectionPaddingX: "1.5rem",
  sectionPaddingY: "3rem",
  sectionGap: "2.25rem",
  /** Flat top; cream fills the pockets under coaches bottom pill. */
  sectionBackground: HOME_PAGE_SURFACE.pageBackground,
  coachesSectionOverlap: HOME_COACHES_SECTION_MOBILE_LAYOUT.sectionBottomRadius,
  headerMaxWidth: "clamp(17rem, calc(100svw * 314 / 394), 19.625rem)",
  titleFontSize: "clamp(2.25rem, calc(100svw * 46 / 394), 2.875rem)",
  titleLineHeight:
    HOME_PLANS_SECTION_MOBILE_FIGMA.titleLineHeightPx / HOME_PLANS_SECTION_MOBILE_FIGMA.titleFontSizePx,
  subtitleFontSize: "clamp(0.8125rem, calc(100svw * 14 / 394), 0.875rem)",
  subtitleLineHeight:
    HOME_PLANS_SECTION_MOBILE_FIGMA.subtitleLineHeightPx / HOME_PLANS_SECTION_MOBILE_FIGMA.subtitleFontSizePx,
  headerSubtitleGap: "1.5rem",
  carouselGap: "1.6875rem",
  carouselHeight: "29.625rem",
  carouselCardWidth: "clamp(18.25rem, calc(100svw * 292 / 394), 18.25rem)",
  carouselCardHeight: "27.5rem",
  carouselCardTotalHeight: "29.625rem",
  cardRadiusPx: HOME_PLANS_SECTION_MOBILE_FIGMA.cardRadiusPx,
  cardGlassOverhangPx: HOME_PLANS_SECTION_MOBILE_FIGMA.glassOverhangPx,
} as const;

export const HOME_PLANS_SECTION_FIGMA = {
  panelFill: HOME_HERO_FIGMA.frostPanelFill,
  headingColor: HOME_PAGE_SURFACE.plansHeading,
  subtitleColor: "rgba(98, 98, 98, 0.84)",
  cardFallbackBg: "#97907c",
  cardRadiusPx: HOME_PAGE_SURFACE.planCardRadiusPx,
  panelRadiusPx: HOME_PAGE_SURFACE.plansPanelRadiusPx,
  categoryColor: "#ffffff",
  priceColor: "#ffffff",
} as const;

export const HOME_PLANS_SECTION_LAYOUT = {
  contentMaxWidthPx: 1332,
  sectionPaddingX: "clamp(1rem, 5vw, 5rem)",
  sectionPaddingTop: "clamp(3rem, 11vw, 6.5rem)",
  sectionPaddingBottom: "clamp(2.5rem, 8vw, 4.5rem)",
  headerGapPx: 41,
  sectionGapPx: 65,
  cardsGapPx: 60,
  titleFontSize: "clamp(2.25rem, 5vw, 4.375rem)",
  titleLineHeight: 48 / 70,
  subtitleMaxWidth: "39.25rem",
  cardWidthPx: 404,
  cardHeightPx: 531,
  cardGlassWidthPx: 291,
  cardGlassHeightPx: 136,
  /** Figma `62:2344` — glass panel overhang below card edge. */
  cardGlassOverhangPx: 34,
  categoryFontSizePx: 28,
  detailsFontSizePx: 18,
  priceFontSizePx: 28,
  ctaIconSizePx: 64,
} as const;

export const HOME_PLANS_SECTION_ASSETS = {
  cardBackground: HOME_SECTION_ASSETS.planBackground,
  cardFab: HOME_SECTION_ASSETS.planCardFab,
} as const;
