import type { CSSProperties } from "react";
import { normalizePackageCategoryKey } from "@/components/admin/package-category-utils";
import accordionStyles from "@/components/marketing/packages/packages-page-accordion.module.css";
import type { PackagesPageAccordionCategory } from "@/components/marketing/packages/packages-page-category-data";
import {
  PACKAGES_PAGE_ACCORDION_FIGMA,
  PACKAGES_PAGE_CARD_FIGMA,
  PACKAGES_PAGE_LAYOUT,
  PACKAGES_PAGE_MOBILE_FIGMA,
  buildPackagesPageCardGradient,
  resolvePackagesPageAccordionRowHeightPx,
} from "@/components/marketing/packages/packages-page-tokens";
import {
  DEFAULT_DESKTOP_CARDS_PER_ROW,
  MAX_DESKTOP_CARDS_PER_ROW,
  MIN_DESKTOP_CARDS_PER_ROW,
} from "@/components/marketing/packages/packages-page-accordion.constants";
import type { DesktopPanelMode } from "@/components/marketing/packages/packages-page-accordion.types";

export function clampDesktopCardsPerRow(value: number | undefined): number {
  if (value === undefined) {
    return DEFAULT_DESKTOP_CARDS_PER_ROW;
  }
  return Math.min(
    MAX_DESKTOP_CARDS_PER_ROW,
    Math.max(MIN_DESKTOP_CARDS_PER_ROW, Math.floor(value)),
  );
}

export function splitAccordionRows(
  categories: readonly PackagesPageAccordionCategory[],
  cardsPerRow: number,
): readonly (readonly PackagesPageAccordionCategory[])[] {
  const rows: PackagesPageAccordionCategory[][] = [];
  for (let index = 0; index < categories.length; index += cardsPerRow) {
    rows.push(categories.slice(index, index + cardsPerRow));
  }
  return rows;
}

/** Locates a plan (and its category) by id across all accordion categories. */
export function toAccordionCategoryGroups(
  categories: readonly PackagesPageAccordionCategory[],
) {
  return categories.map((category) => ({
    id: category.id,
    label: category.label,
    plans: category.plans,
  }));
}

export function panelStyleVars(gradientStartColor: string): CSSProperties {
  const figma = PACKAGES_PAGE_CARD_FIGMA;
  const accordion = PACKAGES_PAGE_ACCORDION_FIGMA;

  return {
    ["--packages-page-panel-gradient" as string]: buildPackagesPageCardGradient(gradientStartColor),
    ["--packages-page-card-radius" as string]: `${figma.cardRadiusPx}px`,
    ["--packages-page-text-color" as string]: figma.textColor,
    ["--packages-page-text-color-hover" as string]: figma.textColorHover,
    ["--packages-page-fab-fill" as string]: figma.fabFill,
    ["--packages-page-fab-fill-opacity" as string]: String(figma.fabFillOpacity),
    ["--packages-page-fab-fill-hover" as string]: figma.fabFillHover,
    ["--packages-page-fab-fill-hover-opacity" as string]: String(figma.fabFillHoverOpacity),
    ["--packages-page-fab-arrow" as string]: figma.fabArrowColor,
    ["--packages-page-fab-size" as string]: `${figma.fabSizePx}px`,
    ["--packages-page-subscribe-text" as string]: gradientStartColor,
    ["--packages-page-collapsed-title-size" as string]: `${accordion.collapsedTitleSizePx}px`,
    ["--packages-page-collapsed-price-size" as string]: `${accordion.collapsedPriceSizePx}px`,
    ["--packages-page-expanded-title-size" as string]: `${accordion.expandedTitleSizePx}px`,
    ["--packages-page-column-header-size" as string]: `${accordion.columnHeaderFontSizePx}px`,
    ["--packages-page-column-header-gap" as string]: `${accordion.columnHeaderGapPx}px`,
    ["--packages-page-tier-row-gap" as string]: `${accordion.tierRowGapPx}px`,
    ["--packages-page-tier-sessions-size" as string]: `${accordion.tierSessionsFontSizePx}px`,
    ["--packages-page-tier-meta-size" as string]: `${accordion.tierMetaFontSizePx}px`,
    ["--packages-page-sessions-color" as string]: accordion.sessionsTextColor,
    ["--packages-page-validity-color" as string]: accordion.validityTextColor,
    ["--packages-page-subscribe-height" as string]: `${accordion.subscribeButtonHeightPx}px`,
    ["--packages-page-subscribe-size" as string]: `${accordion.subscribeFontSizePx}px`,
    ["--packages-page-subscribe-offset" as string]: `${accordion.subscribeColumnOffsetPx}px`,
    ["--packages-page-fab-footer-inset" as string]: `${accordion.fabFooterInsetPx}px`,
  };
}

export function layoutStyleVars(): CSSProperties {
  return {
    ["--packages-page-grid-max-width" as string]: `${PACKAGES_PAGE_LAYOUT.gridMaxWidthPx}px`,
    ["--packages-page-cards-gap" as string]: PACKAGES_PAGE_LAYOUT.cardsGap,
    ["--packages-page-accordion-gap" as string]: PACKAGES_PAGE_LAYOUT.accordionGap,
    ["--packages-page-mobile-accordion-gap" as string]: PACKAGES_PAGE_LAYOUT.mobileAccordionGap,
    ["--packages-page-mobile-collapsed-min-height" as string]:
      PACKAGES_PAGE_LAYOUT.mobileCollapsedCardMinHeight,
    ["--packages-page-mobile-fab-size" as string]: PACKAGES_PAGE_LAYOUT.mobileFabSize,
    ["--packages-page-collapsed-width" as string]: PACKAGES_PAGE_LAYOUT.collapsedPanelWidth,
    ["--packages-page-row-height" as string]: PACKAGES_PAGE_LAYOUT.rowHeight,
    ["--packages-page-expanded-scroll-height" as string]: PACKAGES_PAGE_LAYOUT.expandedScrollHeight,
    ["--packages-page-tier-row-height" as string]: PACKAGES_PAGE_LAYOUT.tierRowHeight,
    ["--packages-page-expanded-table-min-width" as string]: PACKAGES_PAGE_LAYOUT.expandedTableMinWidth,
    ["--packages-page-transition-duration" as string]: `${PACKAGES_PAGE_ACCORDION_FIGMA.transitionDurationMs}ms`,
    ["--packages-page-transition-easing" as string]: PACKAGES_PAGE_ACCORDION_FIGMA.transitionEasing,
    ["--packages-page-mobile-tier-card-radius" as string]: `${PACKAGES_PAGE_MOBILE_FIGMA.tierCardRadiusPx}px`,
    ["--packages-page-mobile-tier-card-gap" as string]: `${PACKAGES_PAGE_MOBILE_FIGMA.tierCardGapPx}px`,
    ["--packages-page-mobile-tier-title-size" as string]: `${PACKAGES_PAGE_MOBILE_FIGMA.tierTitleSizePx}px`,
    ["--packages-page-mobile-tier-meta-label-size" as string]: `${PACKAGES_PAGE_MOBILE_FIGMA.tierMetaLabelSizePx}px`,
    ["--packages-page-mobile-tier-meta-value-size" as string]: `${PACKAGES_PAGE_MOBILE_FIGMA.tierMetaValueSizePx}px`,
    ["--packages-page-mobile-subscribe-height" as string]: `${PACKAGES_PAGE_MOBILE_FIGMA.subscribeButtonHeightPx}px`,
    ["--packages-page-mobile-subscribe-size" as string]: `${PACKAGES_PAGE_MOBILE_FIGMA.subscribeFontSizePx}px`,
    ["--packages-page-mobile-card-radius" as string]: `${PACKAGES_PAGE_MOBILE_FIGMA.collapsedCardRadiusPx}px`,
  };
}

export function rowLayoutStyleVars(cardsPerRow: number, rowItemCount: number): CSSProperties {
  return {
    ...layoutStyleVars(),
    ["--packages-page-desktop-cards-per-row" as string]: String(cardsPerRow),
    ["--packages-page-row-item-count" as string]: String(rowItemCount),
  };
}

function resolveExpandedColumnFrWeight(rowItemCount: number): number {
  const collapsedCount = Math.max(rowItemCount - 1, 1);
  return collapsedCount * 4;
}

const ACCORDION_COLLAPSED_COLUMN_FR = 1;

export function buildAccordionRowGridColumns(
  rowItemCount: number,
  expandedIndexInRow: number | null,
): string {
  if (expandedIndexInRow === null) {
    return Array.from({ length: rowItemCount }, () => "minmax(0, 1fr)").join(" ");
  }

  const expandedFrWeight = resolveExpandedColumnFrWeight(rowItemCount);
  return Array.from({ length: rowItemCount }, (_, index) => {
    if (index === expandedIndexInRow) {
      return `minmax(0, ${expandedFrWeight}fr)`;
    }
    return `minmax(0, ${ACCORDION_COLLAPSED_COLUMN_FR}fr)`;
  }).join(" ");
}

export function buildAccordionRowStyle(
  cardsPerRow: number,
  rowItemCount: number,
  gridExpandedIndex: number | null,
): CSSProperties {
  return {
    ...rowLayoutStyleVars(cardsPerRow, rowItemCount),
    gridTemplateColumns: buildAccordionRowGridColumns(rowItemCount, gridExpandedIndex),
  };
}

export function mobilePanelStyleVars(gradientStartColor: string): CSSProperties {
  const mobile = PACKAGES_PAGE_MOBILE_FIGMA;

  return {
    ...panelStyleVars(gradientStartColor),
    ["--packages-page-mobile-collapsed-title-size" as string]: `${mobile.collapsedTitleSizePx}px`,
    ["--packages-page-mobile-collapsed-details-size" as string]: `${mobile.collapsedDetailsSizePx}px`,
    ["--packages-page-mobile-expanded-padding" as string]: `${mobile.expandedPanelPaddingPx}px`,
    ["--packages-page-mobile-card-radius" as string]: `${mobile.collapsedCardRadiusPx}px`,
  };
}

export function defaultCardStyleVars(gradientStartColor: string): CSSProperties {
  const figma = PACKAGES_PAGE_CARD_FIGMA;

  return {
    ...panelStyleVars(gradientStartColor),
    ["--packages-page-card-aspect-ratio" as string]:
      `${figma.cardWidthPx} / ${resolvePackagesPageAccordionRowHeightPx()}`,
    ["--packages-page-title-size" as string]: `${figma.titleFontSizePx}px`,
    ["--packages-page-title-line-height" as string]: `${figma.titleLineHeightPx}px`,
    ["--packages-page-title-letter-spacing" as string]: `${figma.titleLetterSpacingPx}px`,
    ["--packages-page-price-size" as string]: `${figma.priceFontSizePx}px`,
    ["--packages-page-details-size" as string]: `${figma.detailsFontSizePx}px`,
    ["--packages-page-content-padding-left" as string]: `${figma.contentPaddingLeftPx}px`,
    ["--packages-page-details-offset-left" as string]: `${figma.detailsPaddingLeftPx}px`,
    backgroundImage: buildPackagesPageCardGradient(gradientStartColor),
  };
}

export function resolveDesktopPanelMode(
  isAccordionMode: boolean,
  isExpanded: boolean,
): DesktopPanelMode {
  if (!isAccordionMode) {
    return "idle";
  }
  return isExpanded ? "expanded" : "collapsed";
}

export function resolveAccordionSlotClass(
  isAccordionMode: boolean,
  isExpanded: boolean,
): string {
  if (!isAccordionMode) {
    return accordionStyles.accordionSlot;
  }
  return isExpanded
    ? `${accordionStyles.accordionSlot} ${accordionStyles.accordionSlotExpanded}`
    : `${accordionStyles.accordionSlot} ${accordionStyles.accordionSlotCollapsed}`;
}

export function resolveExpandedCategoryId(
  categories: readonly PackagesPageAccordionCategory[],
  categoryParam: string | null,
): string | null {
  if (categoryParam === null || categoryParam.length === 0) {
    return null;
  }

  const normalizedParam = normalizePackageCategoryKey(decodeURIComponent(categoryParam));
  const match = categories.find(
    (category) => normalizePackageCategoryKey(category.id) === normalizedParam,
  );
  return match?.id ?? null;
}
