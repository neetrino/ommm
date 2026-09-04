"use client";

import { useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { IntegratedSearchFilterChips } from "@/components/shared/search/integrated-search-filter-chips";
import {
  getOmmmOverlayPortalRoot,
  OMMM_FLOATING_MENU_Z_INDEX,
} from "@/lib/ommm-overlay-portal";
import { IntegratedSearchFilterPanel } from "@/components/shared/search/integrated-search-filter-panel";
import {
  buildIntegratedFilterChips,
  type IntegratedFilterField,
} from "@/components/shared/search/integrated-search-filter-types";
import {
  EMPTY_FILTER_VALUES,
  INTEGRATED_SEARCH_FILTER_PANEL_ID,
  INTEGRATED_SEARCH_FILTER_PANEL_POSITION_CLASS,
  INTEGRATED_SEARCH_FILTER_PANEL_SURFACE_CLASS,
} from "@/components/shared/search/integrated-search-filters.constants";
import { IntegratedSearchFilterBar } from "@/components/shared/search/integrated-search-filter-bar";
import { usePortaledFilterPanelPosition } from "@/components/shared/search/use-portaled-filter-panel-position";
import { useIntegratedSearchFilterControls } from "@/components/shared/search/use-integrated-search-filter-controls";

export type IntegratedSearchFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  fields?: readonly IntegratedFilterField[];
  /**
   * Rebuild fields from current filter values (applied or draft).
   * Use for cascading selects (e.g. category → package options).
   */
  resolveFields?: (
    filterValues: Record<string, string>,
  ) => readonly IntegratedFilterField[];
  /**
   * Normalize draft updates before Apply (e.g. clear dependent plan when category changes).
   */
  normalizeDraftChange?: (
    previous: Record<string, string>,
    key: string,
    value: string,
  ) => Record<string, string>;
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onClearAll?: () => void;
  applyLabel: string;
  resetLabel: string;
  clearAriaLabel: string;
  filterPanelAriaLabel: string;
  filterToggleAriaLabel?: string;
  className?: string;
  hideSearch?: boolean;
  portalFilterPanel?: boolean;
  showActiveFilterChips?: boolean;
};

/** Search focuses the keyboard; filter button opens the filter panel. */
export function IntegratedSearchFilters({
  search,
  onSearchChange,
  searchPlaceholder,
  fields,
  resolveFields,
  normalizeDraftChange,
  filterValues = EMPTY_FILTER_VALUES,
  onFilterChange,
  onClearAll,
  applyLabel,
  resetLabel,
  clearAriaLabel,
  filterPanelAriaLabel,
  filterToggleAriaLabel = filterPanelAriaLabel,
  className = "",
  hideSearch = false,
  portalFilterPanel = true,
  showActiveFilterChips = true,
}: IntegratedSearchFiltersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const appliedFields = resolveFields?.(filterValues) ?? fields;
  const hasFilters = Boolean(appliedFields?.length || resolveFields);

  const chips = useMemo(
    () => buildIntegratedFilterChips(appliedFields, filterValues),
    [appliedFields, filterValues],
  );
  const visibleChips = showActiveFilterChips ? chips : [];
  const hasQuery = search.trim().length > 0 || visibleChips.length > 0;

  const {
    panelOpen,
    searchFocused,
    setDraftFilters,
    panelFilterValues,
    handleApply,
    handleReset,
    handleRemoveChip,
    handleSearchFocus,
    openFilterPanel,
    handleFilterToggleClick,
    handleBarPointerDown,
    handleFilterBarClick,
    handleFilterBarKeyDown,
    handleSearchBlur,
    handleSearchChange,
    handleSearchKeyDown,
  } = useIntegratedSearchFilterControls({
    hideSearch,
    hasFilters,
    fields: appliedFields,
    filterValues,
    onSearchChange,
    onFilterChange,
    onClearAll,
    containerRef,
    searchInputRef,
  });

  const panelFields = resolveFields?.(panelFilterValues) ?? appliedFields ?? [];
  const showPanelRing = panelOpen && hasFilters;
  const showQueryRing = hasQuery;
  const showClearButton = hideSearch ? visibleChips.length > 0 : hasQuery;

  const resolvedPanelPosition = usePortaledFilterPanelPosition(
    containerRef,
    panelOpen,
    portalFilterPanel,
  );

  const filterPanel =
    hasFilters && panelOpen ? (
      <div
        id={INTEGRATED_SEARCH_FILTER_PANEL_ID}
        role="dialog"
        aria-label={filterPanelAriaLabel}
        className={
          portalFilterPanel
            ? `fixed ${INTEGRATED_SEARCH_FILTER_PANEL_SURFACE_CLASS}`
            : `${INTEGRATED_SEARCH_FILTER_PANEL_POSITION_CLASS} ${INTEGRATED_SEARCH_FILTER_PANEL_SURFACE_CLASS}`
        }
        style={
          portalFilterPanel && resolvedPanelPosition
            ? {
                top: resolvedPanelPosition.top,
                left: resolvedPanelPosition.left,
                width: resolvedPanelPosition.width,
                maxHeight: resolvedPanelPosition.maxHeight,
                zIndex: OMMM_FLOATING_MENU_Z_INDEX,
                overflowY: "auto",
                overscrollBehavior: "contain",
                WebkitOverflowScrolling: "touch",
              }
            : undefined
        }
      >
        <IntegratedSearchFilterPanel
          fields={panelFields}
          filterValues={panelFilterValues}
          onFilterChange={(key, value) =>
            setDraftFilters((prev) =>
              normalizeDraftChange
                ? normalizeDraftChange(prev, key, value)
                : { ...prev, [key]: value },
            )
          }
          onApply={handleApply}
          onReset={handleReset}
          applyLabel={applyLabel}
          resetLabel={resetLabel}
        />
      </div>
    ) : null;

  return (
    <div
      ref={containerRef}
      className={`relative flex w-full min-w-0 flex-col gap-2 ${panelOpen && hasFilters ? "z-[126]" : ""} ${className}`}
    >
      <IntegratedSearchFilterBar
        searchInputRef={searchInputRef}
        hideSearch={hideSearch}
        hasFilters={hasFilters}
        panelOpen={panelOpen}
        searchFocused={searchFocused}
        search={search}
        searchPlaceholder={searchPlaceholder}
        visibleChips={visibleChips}
        showClearButton={showClearButton}
        showQueryRing={showQueryRing}
        showPanelRing={showPanelRing}
        filterToggleAriaLabel={filterToggleAriaLabel}
        clearAriaLabel={clearAriaLabel}
        onFilterToggleClick={handleFilterToggleClick}
        onBarPointerDown={handleBarPointerDown}
        onFilterBarClick={handleFilterBarClick}
        onFilterBarKeyDown={handleFilterBarKeyDown}
        onSearchChange={handleSearchChange}
        onSearchFocus={handleSearchFocus}
        onSearchBlur={handleSearchBlur}
        onSearchKeyDown={handleSearchKeyDown}
        onReset={handleReset}
        onOpenFilterPanel={openFilterPanel}
        onRemoveChip={handleRemoveChip}
        canRemoveChip={Boolean(onFilterChange)}
      />

      {!hideSearch && visibleChips.length > 0 ? (
        <IntegratedSearchFilterChips
          chips={visibleChips}
          layout="stacked"
          onActivate={hasFilters ? openFilterPanel : undefined}
          onRemove={onFilterChange ? handleRemoveChip : undefined}
        />
      ) : null}

      {portalFilterPanel && filterPanel && typeof document !== "undefined"
        ? createPortal(filterPanel, getOmmmOverlayPortalRoot())
        : filterPanel}
    </div>
  );
}
