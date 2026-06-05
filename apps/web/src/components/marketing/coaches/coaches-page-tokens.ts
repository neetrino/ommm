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
  /** Space between sticky mobile header and hero title (<744px). */
  heroTitleMobileGapBelowHeaderRem: 4,
  gridColumns: 3,
  gridRows: 2,
} as const;

/** Figma Frame 68 `62:2031` / instance `62:2207` — portrait coach card. */
export const COACHES_PAGE_CARD = {
  surface: "#e5f4f9",
  /** Card surface on pointer hover — warm yellow from marketing palette. */
  surfaceHover: "#fbf5d5",
  /** Portrait zoom on hover (1 = none). */
  photoHoverScale: 1.05,
  radiusPx: 40,
  nameColor: "#1d1c15",
  roleColor: "#4a4738",
  bottomBarFill: "rgba(255, 255, 255, 0.46)",
  bottomBarRadiusPx: 50,
  bottomBarHeightPx: 67,
  /** Right inset for collapsed bar arrow — Figma `94:4071` / `62:2036`. */
  expandTriggerInsetPx: 28,
  expandArrowSizePx: 23,
  /** Expanded bottom panel — Figma `94:4071`. */
  expandPanelMinHeightPx: 220,
  expandPanelPaddingPx: 22,
  /** Backdrop blur only — no saturate (avoids warm/yellow tint). */
  expandPanelGlassBlurPx: 10,
  expandPanelGlassBlurExpandedPx: 14,
  expandPanelGlassFillExpanded: "rgba(255, 255, 255, 0.52)",
  expandPanelGlassBorder: "rgba(255, 255, 255, 0.45)",
  expandBioColor: "#1d1c15",
  nameInsetTopPx: 32,
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
  /** Coach name — uniform size (up to two lines). */
  nameFontSizeMinRem: 1.125,
  nameFontSizePreferredVw: 2.75,
  nameFontSizeMaxRem: 1.8125,
  nameMaxLines: 2,
} as const;
