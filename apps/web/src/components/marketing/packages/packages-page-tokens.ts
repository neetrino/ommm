/**
 * Figma **Packages page cards** — component row `395:1652` (1061×495).
 * Per-card gradients from instances `395:1299` … `395:1331`.
 */

/** Shared card chrome from Figma `395:1652`. */
export const PACKAGES_PAGE_CARD_FIGMA = {
  artboardWidthPx: 1061,
  artboardHeightPx: 495,
  cardRadiusPx: 50,
  cardGapPx: 19,
  cardWidthPx: 197,
  cardHeightPx: 495,
  contentPaddingLeftPx: 19,
  detailsPaddingLeftPx: 35,
  titleFontSizePx: 32,
  titleLineHeightPx: 34,
  titleLetterSpacingPx: -0.32,
  priceFontSizePx: 20,
  detailsFontSizePx: 20,
  textColor: "#97907c",
  /** Darker label/FAB on Details hover — same hue as `textColor`. */
  textColorHover: "#6a6454",
  fabSizePx: 86,
  fabFill: "#282828",
  fabFillOpacity: 0.31,
  fabFillHover: "#0a0a0a",
  fabFillHoverOpacity: 0.62,
  fabArrowColor: "#ffffff",
  gradientAngleDeg: 173.82,
  gradientStartPercent: 2.0655,
  gradientEndPercent: 102,
  gradientEndColor: "#ffffff",
} as const;

/** Figma expanded accordion — `395:1341` Variant2. */
export const PACKAGES_PAGE_ACCORDION_FIGMA = {
  collapsedWidthPx: 120,
  accordionGapPx: 10,
  expandedMinTableWidthPx: 640,
  expandedTitleSizePx: 32,
  collapsedTitleSizePx: 22,
  collapsedPriceSizePx: 20,
  columnHeaderFontSizePx: 12,
  tierSessionsFontSizePx: 18,
  tierMetaFontSizePx: 16,
  tierRowGapPx: 37,
  columnHeaderGapPx: 28,
  sessionsTextColor: "rgba(44, 44, 44, 0.89)",
  validityTextColor: "#4a4738",
  subscribeButtonHeightPx: 30,
  subscribeFontSizePx: 16,
  subscribeColumnOffsetPx: 10,
  /** Collapsed panel bottom padding (5px) + FAB wrap padding (4px). */
  fabFooterInsetPx: 9,
  transitionDurationMs: 450,
  transitionEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

/** Category-specific gradient start colors — Figma card fills left → right. */
export const PACKAGES_PAGE_CATEGORY_GRADIENT_START: Readonly<Record<string, string>> = {
  "reformer group": "#fbf5d5",
  "reformer individual": "#e5f4f9",
  "mat pilates": "#f6d0bd",
  yoga: "#ede9dd",
  dances: "#d9d9d9",
};

export const PACKAGES_PAGE_CATEGORY_COLOR_VARIANT_KEYS = [
  "reformer group",
  "reformer individual",
  "mat pilates",
  "yoga",
  "dances",
] as const;

export type PackagesPageCategoryColorVariantKey =
  (typeof PACKAGES_PAGE_CATEGORY_COLOR_VARIANT_KEYS)[number];

/** Figma Packages mobile accordion — collapsed card + inline expanded panel. */
export const PACKAGES_PAGE_MOBILE_FIGMA = {
  accordionGapPx: 18,
  collapsedCardMinHeightPx: 118,
  collapsedCardRadiusPx: 24,
  collapsedTitleSizePx: 28,
  collapsedDetailsSizePx: 16,
  mobileFabSizePx: 58,
  expandedPanelPaddingPx: 20,
  tierCardRadiusPx: 20,
  tierCardGapPx: 14,
  tierTitleSizePx: 22,
  tierMetaLabelSizePx: 14,
  tierMetaValueSizePx: 16,
  subscribeButtonHeightPx: 48,
  subscribeFontSizePx: 18,
} as const;

export const PACKAGES_PAGE_LAYOUT = {
  gridMaxWidthPx: PACKAGES_PAGE_CARD_FIGMA.artboardWidthPx,
  cardsGap: "clamp(0.75rem, 1.79vw, 1.1875rem)",
  mobileAccordionGap: `${PACKAGES_PAGE_MOBILE_FIGMA.accordionGapPx}px`,
  mobileCollapsedCardMinHeight: `${PACKAGES_PAGE_MOBILE_FIGMA.collapsedCardMinHeightPx}px`,
  mobileFabSize: `${PACKAGES_PAGE_MOBILE_FIGMA.mobileFabSizePx}px`,
  accordionGap: `${PACKAGES_PAGE_ACCORDION_FIGMA.accordionGapPx}px`,
  collapsedPanelWidth: `${PACKAGES_PAGE_ACCORDION_FIGMA.collapsedWidthPx}px`,
  rowHeight: `${PACKAGES_PAGE_CARD_FIGMA.cardHeightPx}px`,
  expandedTableMinWidth: `${PACKAGES_PAGE_ACCORDION_FIGMA.expandedMinTableWidthPx}px`,
} as const;

export function resolvePackagesPageCategoryAccentColor(categoryKey: string): string {
  const normalizedKey = categoryKey.trim().toLocaleLowerCase();
  return (
    PACKAGES_PAGE_CATEGORY_GRADIENT_START[normalizedKey] ??
    PACKAGES_PAGE_CATEGORY_GRADIENT_START.dances
  );
}

export function buildPackagesPageCategoryGradient(categoryKey: string): string {
  const normalizedKey = categoryKey.trim().toLocaleLowerCase();
  const startColor =
    PACKAGES_PAGE_CATEGORY_GRADIENT_START[normalizedKey] ??
    PACKAGES_PAGE_CATEGORY_GRADIENT_START.dances;
  const { gradientAngleDeg, gradientStartPercent, gradientEndPercent, gradientEndColor } =
    PACKAGES_PAGE_CARD_FIGMA;

  return `linear-gradient(${gradientAngleDeg}deg, ${startColor} ${gradientStartPercent}%, ${gradientEndColor} ${gradientEndPercent}%)`;
}
