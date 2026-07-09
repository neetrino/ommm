/**
 * Figma **Packages page cards** — component row `395:1652` (1061×495 base artboard).
 * Row height is derived from {@link PACKAGES_PAGE_VISIBLE_TIER_COUNT} visible tiers.
 * Per-card gradients from instances `395:1299` … `395:1331`.
 */

/** Session rows shown without scroll in desktop accordion (expanded + collapsed row height). */
export const PACKAGES_PAGE_VISIBLE_TIER_COUNT = 5;

/**
 * Expanded accordion layout slices (px) — keep in sync with `packages-page-accordion.module.css`.
 */
export const PACKAGES_PAGE_ACCORDION_LAYOUT = {
  expandedPanelPaddingTopPx: 43,
  expandedHeaderBlockPx: 52,
  tierTableSectionGapPx: 18,
  columnHeaderHeightPx: 23,
  /** Extra row height so ≤5 tiers never clip or scroll from subpixel layout. */
  rowHeightBufferPx: 8,
} as const;

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
  expandedMinTableWidthPx: 760,
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

/** Desktop accordion row height — fits {@link PACKAGES_PAGE_VISIBLE_TIER_COUNT} tier rows before scroll. */
export function resolvePackagesPageAccordionRowHeightPx(): number {
  const layout = PACKAGES_PAGE_ACCORDION_LAYOUT;
  const accordion = PACKAGES_PAGE_ACCORDION_FIGMA;
  const card = PACKAGES_PAGE_CARD_FIGMA;
  const visibleTierBlockHeight =
    PACKAGES_PAGE_VISIBLE_TIER_COUNT * accordion.subscribeButtonHeightPx +
    (PACKAGES_PAGE_VISIBLE_TIER_COUNT - 1) * accordion.tierRowGapPx;

  return (
    layout.expandedPanelPaddingTopPx +
    layout.expandedHeaderBlockPx +
    layout.tierTableSectionGapPx +
    layout.columnHeaderHeightPx +
    visibleTierBlockHeight +
    card.fabSizePx +
    accordion.fabFooterInsetPx +
    layout.rowHeightBufferPx
  );
}

/** Scroll viewport inside expanded panel — header + table chrome + visible tier rows. */
export function resolvePackagesPageExpandedScrollHeightPx(): number {
  const layout = PACKAGES_PAGE_ACCORDION_LAYOUT;
  const accordion = PACKAGES_PAGE_ACCORDION_FIGMA;
  const visibleTierBlockHeight =
    PACKAGES_PAGE_VISIBLE_TIER_COUNT * accordion.subscribeButtonHeightPx +
    (PACKAGES_PAGE_VISIBLE_TIER_COUNT - 1) * accordion.tierRowGapPx;

  return (
    layout.expandedHeaderBlockPx +
    layout.tierTableSectionGapPx +
    layout.columnHeaderHeightPx +
    visibleTierBlockHeight
  );
}

/** Desktop expanded tier table — wider plan column for long mixed package names. */
export const PACKAGES_PAGE_TIER_TABLE_COLUMNS =
  "minmax(11rem, 2.5fr) minmax(3.25rem, 0.85fr) minmax(4.75rem, 1.05fr) minmax(4rem, 0.9fr) minmax(2.5rem, 0.5fr) minmax(5.75rem, 1.1fr)";

export const PACKAGES_PAGE_LAYOUT = {
  gridMaxWidthPx: PACKAGES_PAGE_CARD_FIGMA.artboardWidthPx,
  cardsGap: "clamp(0.75rem, 1.79vw, 1.1875rem)",
  mobileAccordionGap: `${PACKAGES_PAGE_MOBILE_FIGMA.accordionGapPx}px`,
  mobileCollapsedCardMinHeight: `${PACKAGES_PAGE_MOBILE_FIGMA.collapsedCardMinHeightPx}px`,
  mobileFabSize: `${PACKAGES_PAGE_MOBILE_FIGMA.mobileFabSizePx}px`,
  accordionGap: `${PACKAGES_PAGE_ACCORDION_FIGMA.accordionGapPx}px`,
  collapsedPanelWidth: `${PACKAGES_PAGE_ACCORDION_FIGMA.collapsedWidthPx}px`,
  rowHeight: `${resolvePackagesPageAccordionRowHeightPx()}px`,
  expandedScrollHeight: `${resolvePackagesPageExpandedScrollHeightPx()}px`,
  tierRowHeight: `${PACKAGES_PAGE_ACCORDION_FIGMA.subscribeButtonHeightPx}px`,
  expandedTableMinWidth: `${PACKAGES_PAGE_ACCORDION_FIGMA.expandedMinTableWidthPx}px`,
} as const;

/** Card background gradient — Figma angle with a palette-assigned start color. */
export function buildPackagesPageCardGradient(gradientStartColor: string): string {
  const { gradientAngleDeg, gradientStartPercent, gradientEndPercent, gradientEndColor } =
    PACKAGES_PAGE_CARD_FIGMA;

  return `linear-gradient(${gradientAngleDeg}deg, ${gradientStartColor} ${gradientStartPercent}%, ${gradientEndColor} ${gradientEndPercent}%)`;
}
