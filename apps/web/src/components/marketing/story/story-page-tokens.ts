/** Figma Story page — surface, typography, and layout tokens. */
export const STORY_PAGE_SURFACE = {
  cardBackground: "#faf7f2",
  cardBackgroundAlt: "#f5f0e8",
  body: "#4a4738",
  bodyMuted: "#6b665c",
  accent: "#b38b59",
  valuesLine: "rgba(74, 71, 56, 0.18)",
} as const;

export const STORY_PAGE_LAYOUT = {
  cardRadius: "clamp(1.5rem, 3vw, 2rem)",
  heroArchRadiusTop: "clamp(8rem, 26vw, 15rem)",
  heroArchRadiusBottom: "clamp(2.25rem, 5vw, 3rem)",
  heroVisualMaxWidth: "clamp(22rem, 42vw, 32rem)",
  heroVisualAspectRatio: "6 / 7",
  sectionGap: "clamp(2rem, 5vw, 3.5rem)",
  cardPadding: "clamp(1.25rem, 3vw, 2.5rem)",
  valuesGridGap: "clamp(1rem, 2.5vw, 1.5rem)",
  /** Feature cards pulled up over the hero portrait. */
  featureCardsHeroOverlap: "clamp(6rem, 14vw, 11rem)",
  /** Hero portrait nudge toward the text column. */
  heroVisualOffsetLeftPx: 50,
  /** Hero branch fine-tune — right and up from base anchor. */
  heroBranchOffsetRightPx: 150,
  heroBranchOffsetUpPx: 60,
} as const;
