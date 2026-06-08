"use client";

import { useTranslations } from "next-intl";
import {
  IntegratedSearchFilters,
  type IntegratedSearchFiltersProps,
} from "@/components/shared/search/integrated-search-filters";

type ListPageSearchFiltersProps = Omit<
  IntegratedSearchFiltersProps,
  "applyLabel" | "clearAriaLabel" | "filterPanelAriaLabel"
>;

/**
 * List-page search + filter bar with shared i18n labels — admin, manager, coach, and user staff views.
 */
export function ListPageSearchFilters({
  className = "min-w-0 flex-1",
  ...props
}: ListPageSearchFiltersProps) {
  const tSearchTools = useTranslations("adminPages.searchTools");

  return (
    <IntegratedSearchFilters
      className={className}
      applyLabel={tSearchTools("applyFilters")}
      clearAriaLabel={tSearchTools("clearSearchAndFilters")}
      filterPanelAriaLabel={tSearchTools("filterPanelAria")}
      filterToggleAriaLabel={tSearchTools("filterToggleAria")}
      {...props}
    />
  );
}
