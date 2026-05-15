/**
 * Figma frame **Main** `155:107` — shared marketing home surface tokens (non-hero).
 */

export const HOME_PAGE_SURFACE = {
  pageBackground: "#fbf5d5",
  classesGradientFrom: "#97907c",
  classesGradientTo: "#577f91",
  coachesGradientFrom: "#598090",
  coachesGradientTo: "#ede9dd",
  eventsGradientFrom: "#598090",
  eventsGradientTo: "#ede9dd",
  /** Frosted “Sanctuary” panel — fill, specular gloss, elevation (marketing home plans only). */
  plansCardFill:
    "linear-gradient(180deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.36) 48%, rgba(255,255,255,0.24) 100%)",
  plansCardGlossOverlay:
    "linear-gradient(152deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.08) 40%, rgba(255,255,255,0) 62%)",
  plansCardShadow:
    "0 24px 56px -24px rgba(45, 55, 62, 0.22), inset 0 1px 0 rgba(255,255,255,0.88), inset 0 -1px 0 rgba(87,127,145,0.08)",
  plansHeading: "#577f91",
  introHeading: "#695f00",
  introBody: "#4a4738",
  introEyebrow: "#665f33",
  cardTitle: "#1d1c15",
  cardBody: "#4a4738",
  classCardRadiusPx: 40,
  planCardRadiusPx: 40,
  plansPanelRadiusPx: 50,
  footerSurface: "#fbf5d5",
  footerWordmark: "#e8da74",
  footerLinks: "#64748b",
} as const;

export const HOME_CLASS_CARD_BACKGROUNDS = [
  "#e5f4f9",
  "#ede9dd",
  "#f6d0bd",
  "#bbd2da",
  "#cbc2b4",
  "#fcf6d6",
] as const;
