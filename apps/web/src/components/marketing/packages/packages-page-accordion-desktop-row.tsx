"use client";

import accordionStyles from "@/components/marketing/packages/packages-page-accordion.module.css";
import { PackagesSlotReveal } from "@/components/marketing/packages/packages-slot-reveal";
import {
  buildAccordionRowStyle,
  resolveAccordionSlotClass,
} from "@/components/marketing/packages/packages-page-accordion.helpers";
import type { DesktopAccordionRowProps } from "@/components/marketing/packages/packages-page-accordion.types";
import { PackagesPageAccordionDesktopSlot } from "@/components/marketing/packages/packages-page-accordion-desktop-slot";
import { useDeferredAccordionGridIndex } from "@/components/marketing/packages/use-deferred-accordion-grid-index";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function PackagesPageAccordionDesktopRow({
  locale,
  row,
  rowIndex,
  expandedCategory,
  cardsPerRow,
  detailsLabel,
  resolveOpenLabel,
  resolveCloseLabel,
  audience,
  selectedPlanId,
  onSelectPlan,
  onSubscribe,
  onOpen,
  onClose,
}: DesktopAccordionRowProps) {
  const reducedMotion = usePrefersReducedMotion();
  const rowExpandedCategory =
    row.find((category) => category.id === expandedCategory?.id) ?? null;
  const expandedIndexInRow =
    rowExpandedCategory !== null
      ? row.findIndex((category) => category.id === rowExpandedCategory.id)
      : null;
  const gridExpandedIndex = useDeferredAccordionGridIndex(expandedIndexInRow, reducedMotion);
  const isRowAccordionMode = gridExpandedIndex !== null;

  const isIncompleteRow = row.length < cardsPerRow;
  const rowClassName = [
    accordionStyles.accordionRow,
    accordionStyles.accordionRowGrid,
    isIncompleteRow && expandedIndexInRow === null
      ? accordionStyles.accordionRowCentered
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rowClassName}
      style={buildAccordionRowStyle(cardsPerRow, row.length, gridExpandedIndex)}
    >
      {row.map((category, indexInRow) => (
        <div
          key={category.id}
          className={resolveAccordionSlotClass(
            isRowAccordionMode,
            isRowAccordionMode && rowExpandedCategory?.id === category.id,
          )}
        >
          <PackagesSlotReveal
            index={rowIndex * cardsPerRow + indexInRow}
            gridColumns={cardsPerRow}
          >
            <PackagesPageAccordionDesktopSlot
              locale={locale}
              category={category}
              expandedCategory={isRowAccordionMode ? rowExpandedCategory : null}
              detailsLabel={detailsLabel}
              openLabel={resolveOpenLabel(category.label)}
              closeLabel={resolveCloseLabel(category.label)}
              audience={audience}
              selectedPlanId={selectedPlanId}
              onSelectPlan={onSelectPlan}
              onSubscribe={onSubscribe}
              onOpen={onOpen}
              onClose={onClose}
            />
          </PackagesSlotReveal>
        </div>
      ))}
    </div>
  );
}
