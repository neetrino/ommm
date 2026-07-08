/** Figma Packages mobile accordion tokens — mirrors web `packages-page-tokens.ts`. */
export const PACKAGES_PAGE_CARD = {
  textColor: "#97907c",
  gradientEndColor: "#ffffff",
  gradientAngleDeg: 173.82,
} as const;

export const PACKAGES_PAGE_MOBILE = {
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
  fabFill: "#282828",
  fabFillOpacity: 0.31,
  fabArrowColor: "#ffffff",
} as const;

export function buildPackagesPageCardGradientColors(
  gradientStartColor: string,
): readonly [string, string] {
  return [gradientStartColor, PACKAGES_PAGE_CARD.gradientEndColor];
}
