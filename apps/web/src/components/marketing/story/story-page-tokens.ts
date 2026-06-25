/** Figma Story page — surface, typography, and layout tokens. */
import { HOME_COACHES_SECTION_FIGMA } from "@/components/marketing/home/home-coaches-section-tokens";

export const STORY_PAGE_SURFACE = {
  cardBackground: "#fdf9f6",
  cardBackgroundAlt: "#fdf9f6",
  body: "#5c574f",
  bodyMuted: "#8a847a",
  heading: "#1d1c15",
  accent: "#b89c7e",
  badgeBorder: "rgba(29, 28, 21, 0.18)",
  valuePeaceSurface: "#fdf9f6",
  valueStrengthSurface: "#fdf9f6",
  valueCommunitySurface: "#fdf9f6",
} as const;

export const STORY_PAGE_LAYOUT = {
  /** Single-column blocks — hero, section headers, closing card. */
  revealGridColumns: 1,
  /** Feature intro cards — two-up grid on desktop. */
  featureCardsGridColumns: 2,
  /** Values grid — three-up layout aligned with coaches page stagger. */
  valuesGridColumns: 3,
  cardRadius: "clamp(1.5rem, 3vw, 2rem)",
  storyCardRadius: "clamp(2.25rem, 4vw, 3rem)",
  closingCardRadius: "clamp(1.75rem, 3vw, 2.25rem)",
  storyCardShadow:
    "0 1rem 2.5rem -1.25rem rgba(45, 40, 35, 0.08), 0 0.25rem 0.75rem -0.25rem rgba(45, 40, 35, 0.06)",
  /** Figma `672:869` — background frame height at 1440px artboard. */
  heroBackgroundHeight: "clamp(36rem, 58.75vw, 52.9375rem)",
  /** Figma `672:869` — 1442px width on 1440 artboard. */
  heroBackgroundWidthBleed: "100.14%",
  /** Figma `672:869` — frame nudge above shell top. */
  heroBackgroundTopOffset: "-0.125rem",
  heroMinHeight: "clamp(36rem, 58.75vw, 52.9375rem)",
  /** Figma `670:809` header top — 152px at 1440. */
  heroContentPaddingTop: "clamp(5.5rem, 10.5vw, 9.5rem)",
  heroContentPaddingTopMobile:
    "calc(var(--marketing-mobile-header-height, 4.25rem) + clamp(1rem, 3vw, 1.5rem))",
  /** Figma `670:815` — Newsreader SemiBold 116px. */
  heroTitleSize: "clamp(3.5rem, 8vw, 7.25rem)",
  /** Figma `670:816` — Montserrat Light 18px / 303px. */
  heroLedeSize: "clamp(1rem, 1.25vw, 1.125rem)",
  heroLedeMaxWidth: "18.9375rem",
  /** Figma `670:822` / `670:831` — feature intro titles at 27px. */
  heroFeatureTitleSize: "clamp(1.375rem, 1.9vw, 1.6875rem)",
  /** Figma `670:823` / `670:832` — feature intro body at 14px. */
  heroFeatureBodySize: "clamp(0.8125rem, 1vw, 0.875rem)",
  /** Figma feature copy block width — 553.5px at 1440. */
  heroFeatureMaxWidth: "34.59375rem",
  /** Figma `670:819` → `670:828` — 118px between block tops at 1440. */
  heroFeatureGap: "clamp(3rem, 8.2vw, 7.375rem)",
  /** Figma feature blocks — left edge of header (`left: 0`). */
  heroFeatureMarginTop: "clamp(1.5rem, 6vw, 4.5rem)",
  sectionGap: "clamp(2rem, 5vw, 3.5rem)",
  cardPadding: "clamp(1.25rem, 3vw, 2.5rem)",
  valuesGridGap: "clamp(1rem, 2.5vw, 1.5rem)",
  valuesCardRadius: "clamp(2.25rem, 4vw, 3rem)",
  valuesCardMinHeight: "clamp(25rem, 46vw, 32rem)",
  valuesCardImageMinHeight: "clamp(12.5rem, 28vw, 17rem)",
  /** iPad Mini — equal taller cards so copy fits in three columns. */
  valuesCardMinHeightTablet: "30rem",
  valuesCardImageMinHeightTablet: "12rem",
  valuesHeadingColor: HOME_COACHES_SECTION_FIGMA.headingColor,
  valuesSubtitleColor: HOME_COACHES_SECTION_FIGMA.subtitleColor,
  valuesSectionMarginTop: "clamp(2.5rem, 6vw, 4rem)",
  valuesSectionMarginTopMobile: "clamp(2.5rem, 8vw, 4rem)",
  featureCardsHeroOverlap: "0",
  featureCardRadius: "clamp(2.25rem, 4vw, 3rem)",
  featureCardCtaBackground: "#dbcab3",
  featureCardCtaHover: "#d0b89e",
} as const;
