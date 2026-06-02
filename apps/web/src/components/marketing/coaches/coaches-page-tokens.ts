/**
 * Figma **Coaches** page `62:2182` — surface and layout tokens (footer excluded).
 */

export const COACHES_PAGE_SURFACE = {
  gradientFrom: "#577f91",
  gradientTo: "#ede9dd",
  heading: "#fbf5d5",
  lead: "rgba(255, 255, 255, 0.73)",
} as const;

/** Figma **Coaches** `62:2182` — hero title / lead / grid placement. */
export const COACHES_PAGE_LAYOUT = {
  artboardWidthPx: 1440,
  /** Title block top — node `62:2183`. */
  heroTitleTopPx: 160,
  /** Lead top — node `62:2273`. */
  heroLeadTopPx: 239,
  /** First card row top — node `62:2206`. */
  gridTopPx: 294,
  /** Extra downward offset applied to hero + grid (post-design tweak). */
  heroOffsetExtraPx: 0,
  gridColumns: 3,
  gridRows: 2,
} as const;

/** Figma Frame 68 `62:2031` / instance `62:2207` — portrait coach card. */
export const COACHES_PAGE_CARD = {
  surface: "#e5f4f9",
  radiusPx: 40,
  nameColor: "#1d1c15",
  roleColor: "#4a4738",
  bottomBarFill: "rgba(255, 255, 255, 0.46)",
  bottomBarRadiusPx: 50,
  bottomBarHeightPx: 67,
  /** Right inset for collapsed bar arrow — Figma `94:4071`. */
  expandTriggerInsetPx: 28,
  /** Expanded bottom panel — Figma `94:4071`. */
  expandPanelMinHeightPx: 220,
  expandPanelPaddingPx: 22,
  expandPanelGlassBlurPx: 72,
  expandPanelGlassBlurExpandedPx: 120,
  expandPanelGlassSaturatePercent: 180,
  expandPanelGlassFill: "rgba(255, 255, 255, 0.34)",
  expandPanelGlassFillExpanded: "rgba(255, 255, 255, 0.36)",
  expandPanelGlassBorder: "rgba(255, 255, 255, 0.42)",
  expandBioColor: "#1d1c15",
  nameInsetTopPx: 20,
  nameInsetLeftPx: 30,
  roleInsetTopPx: 81,
  photoInsetLeftPx: 86,
  photoInsetTopPx: 50,
  photoWidthPx: 342,
  photoHeightPx: 597,
  /** Horizontal gap between cards — Figma `62:2206` gap 33px. */
  gridColumnGapPx: 33,
  /** Vertical gap between rows — Figma row tops 294px / 966px with 617px cards. */
  gridRowGapPx: 55,
  designWidthPx: 428,
  designHeightPx: 617,
} as const;
