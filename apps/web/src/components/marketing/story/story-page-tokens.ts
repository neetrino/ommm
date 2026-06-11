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
  cardRadius: "clamp(1.5rem, 3vw, 2rem)",
  storyCardRadius: "clamp(2.25rem, 4vw, 3rem)",
  closingCardRadius: "clamp(1.75rem, 3vw, 2.25rem)",
  storyCardShadow:
    "0 1rem 2.5rem -1.25rem rgba(45, 40, 35, 0.08), 0 0.25rem 0.75rem -0.25rem rgba(45, 40, 35, 0.06)",
  heroArchRadiusTop: "clamp(8rem, 26vw, 15rem)",
  heroArchRadiusBottom: "clamp(2.25rem, 5vw, 3rem)",
  heroVisualMaxWidth: "clamp(22rem, 42vw, 32rem)",
  /** iPad Mini / tablet hero — narrow title (~3 words per line) + portrait beside copy. */
  heroTabletTitleMaxWidth: "11ch",
  heroTabletLeadMaxWidth: "13.5rem",
  heroTabletVisualMaxWidth: "clamp(13rem, 36vw, 17rem)",
  heroTabletVisualNudgeY: "-0.25rem",
  heroTabletCopyNudgeY: "-1.25rem",
  heroVisualAspectRatio: "6 / 7",
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
  valuesSectionMarginTopMobile: "clamp(6rem, 22vw, 8rem)",
  /** Feature cards pulled up over the hero portrait. */
  featureCardsHeroOverlap: "clamp(6rem, 14vw, 11rem)",
  featureCardRadius: "clamp(2.25rem, 4vw, 3rem)",
  featureCardCtaBackground: "#dbcab3",
  featureCardCtaHover: "#d0b89e",
  /** Hero portrait nudge toward the text column (desktop). */
  heroVisualOffsetLeftPx: 50,
  /** Hero branch fine-tune — right and up from base anchor (desktop). */
  heroBranchOffsetRightPx: 150,
  heroBranchOffsetUpPx: 60,
} as const;
