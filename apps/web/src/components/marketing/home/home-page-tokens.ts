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
    "linear-gradient(180deg, rgba(48,56,64,0.088) 0%, rgba(48,56,64,0.052) 50%, rgba(48,56,64,0.118) 100%), linear-gradient(180deg, rgba(255,255,255,0.48) 0%, rgba(255,255,255,0.30) 48%, rgba(255,255,255,0.17) 100%)",
  plansCardGlossOverlay:
    "linear-gradient(155deg, rgba(255,255,255,0.44) 0%, rgba(255,255,255,0.12) 32%, rgba(255,255,255,0) 54%), linear-gradient(180deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.045) 26%, rgba(255,255,255,0) 48%), linear-gradient(105deg, rgba(255,255,255,0) 4%, rgba(255,255,255,0.055) 46%, rgba(255,255,255,0.075) 52%, rgba(255,255,255,0) 96%), radial-gradient(120% 88% at 88% 5%, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0) 46%)",
  plansCardShadow:
    "0 26px 58px -24px rgba(45, 55, 62, 0.32), inset 0 1px 0 rgba(255,255,255,0.94), inset 0 -1px 0 rgba(87,127,145,0.12)",
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
