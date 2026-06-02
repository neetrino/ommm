/**
 * Figma **Packages** `196:1251` — frosted panel, heading `196:1252`, cards `196:1256`, CTA `196:1260`.
 */

import { HOME_HERO_FIGMA } from "@/components/marketing/home/home-hero-banner-tokens";
import { HOME_PAGE_SURFACE } from "@/components/marketing/home/home-page-tokens";
import { HOME_SECTION_ASSETS } from "@/components/marketing/home/home-section-assets";

export const HOME_PLANS_SECTION_FIGMA = {
  panelFill: HOME_HERO_FIGMA.frostPanelFill,
  headingColor: HOME_PAGE_SURFACE.plansHeading,
  subtitleColor: "rgba(98, 98, 98, 0.84)",
  cardFallbackBg: "#97907c",
  cardGlassFill: "rgba(255, 255, 255, 0.15)",
  cardGlassTint: "rgba(255, 255, 255, 0.22)",
  cardGlassBorder: "rgba(255, 255, 255, 0.32)",
  cardGlassHighlight: "rgba(255, 255, 255, 0.38)",
  cardGlassBlurPx: 28,
  cardRadiusPx: HOME_PAGE_SURFACE.planCardRadiusPx,
  panelRadiusPx: HOME_PAGE_SURFACE.plansPanelRadiusPx,
  categoryColor: "#ffffff",
  priceColor: "#ffffff",
} as const;

export const HOME_PLANS_SECTION_LAYOUT = {
  contentMaxWidthPx: 1332,
  sectionPaddingX: "clamp(1rem, 5vw, 5rem)",
  sectionPaddingTop: "clamp(3rem, 11vw, 6.5rem)",
  sectionPaddingBottom: "clamp(4rem, 14vw, 12.5rem)",
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
