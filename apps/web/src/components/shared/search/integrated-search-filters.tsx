"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { IntegratedSearchFilterChips } from "@/components/shared/search/integrated-search-filter-chips";
import {
  getOmmmOverlayPortalRoot,
  OMMM_FLOATING_MENU_Z_INDEX,
} from "@/lib/ommm-overlay-portal";
import { IntegratedSearchFilterPanel } from "@/components/shared/search/integrated-search-filter-panel";
import {
  buildIntegratedFilterChips,
  clearIntegratedFilterValues,
  resolveIntegratedFilterEmptyValue,
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

export type IntegratedSearchFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  fields?: readonly IntegratedFilterField[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onClearAll?: () => void;
  applyLabel: string;
  resetLabel: string;
  clearAriaLabel: string;
  filterPanelAriaLabel: string;
  /** Accessible label for the in-field filter toggle (search + filter inputs). */
  filterToggleAriaLabel?: string;
  className?: string;
  /** When true, omits the text search input — filter panel opens via filter button (overview period-only). */
  hideSearch?: boolean;
  /** Renders the filter panel in a body portal (sticky headers + tab layouts). */
  portalFilterPanel?: boolean;
  /** When false, active filter chips are hidden (e.g. once list results are found). */
  showActiveFilterChips?: boolean;
};

/** Search focuses the keyboard; filter button opens the filter panel. */
export function IntegratedSearchFilters({
  search,
  onSearchChange,
  searchPlaceholder,
  fields,
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
  const [panelOpen, setPanelOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [draftFilters, setDraftFilters] = useState(filterValues);
  const hasFilters = Boolean(fields?.length);
  const portaledPanelPosition = usePortaledFilterPanelPosition(
    containerRef,
    panelOpen,
    portalFilterPanel,
  );

  const chips = useMemo(
    () => buildIntegratedFilterChips(fields, filterValues),
    [fields, filterValues],
  );
  const visibleChips = showActiveFilterChips ? chips : [];
  const hasQuery = search.trim().length > 0 || visibleChips.length > 0;
  const panelFilterValues = panelOpen ? draftFilters : filterValues;
  const showPanelRing = panelOpen && hasFilters;
  const showQueryRing = hasQuery;

  useEffect(() => {
    if (!panelOpen) {
      return undefined;
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      if (containerRef.current?.contains(target)) {
        return;
      }
      if (target.closest(`#${INTEGRATED_SEARCH_FILTER_PANEL_ID}`)) {
        return;
      }
      if (target.closest("#ommm-overlay-portal")) {
        return;
      }
      if (target.closest(".ommm-dropdown-menu")) {
        return;
      }
      if (target.closest('[role="dialog"][aria-label="Date picker calendar"]')) {
        return;
      }
      setPanelOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPanelOpen(false);
      }
    };

    const openTimer = window.setTimeout(() => {
      document.addEventListener("pointerdown", onPointerDown);
      document.addEventListener("keydown", onKeyDown);
    }, 0);

    return () => {
      window.clearTimeout(openTimer);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [panelOpen]);

  function handleApply() {
    if (!onFilterChange || !fields) {
      setPanelOpen(false);
      return;
    }
    for (const field of fields) {
      const next = draftFilters[field.key] ?? "";
      if (next !== (filterValues[field.key] ?? "")) {
        onFilterChange(field.key, next);
      }
    }
    setPanelOpen(false);
  }

  function handleReset() {
    const cleared = clearIntegratedFilterValues(fields);
    setDraftFilters(cleared);
    onClearAll?.();
    onSearchChange("");
    setPanelOpen(false);
  }

  function handleRemoveChip(key: string) {
    if (!onFilterChange || !fields) {
      return;
    }
    const field = fields.find((item) => item.key === key);
    if (!field) {
      return;
    }
    onFilterChange(key, resolveIntegratedFilterEmptyValue(field));
  }

  function focusSearchField() {
    if (hideSearch) {
      return;
    }
    setPanelOpen(false);
    searchInputRef.current?.focus();
  }

  function handleSearchFocus() {
    setSearchFocused(true);
    setPanelOpen(false);
  }

  function openFilterPanel() {
    if (!hasFilters) {
      return;
    }
    searchInputRef.current?.blur();
    setDraftFilters(filterValues);
    setPanelOpen(true);
  }

  function openPanel() {
    openFilterPanel();
  }

  function toggleFilterPanel() {
    if (!hasFilters) {
      return;
    }
    if (panelOpen) {
      setPanelOpen(false);
      return;
    }
    openFilterPanel();
  }

  function handleFilterToggleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    toggleFilterPanel();
  }

  function handleBarPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (hideSearch) {
      return;
    }
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    if (target.closest("button")) {
      return;
    }
    if (target === searchInputRef.current) {
      return;
    }
    focusSearchField();
  }

  function handleFilterBarClick() {
    if (hideSearch && hasFilters) {
      openPanel();
    }
  }

  function handleFilterBarKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!hideSearch || !hasFilters) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPanel();
    }
  }

  const showClearButton = hideSearch ? visibleChips.length > 0 : hasQuery;

  function handleSearchBlur() {
    window.setTimeout(() => {
      const active = document.activeElement;
      if (containerRef.current?.contains(active)) {
        return;
      }
      if (active instanceof Element && active.closest(`#${INTEGRATED_SEARCH_FILTER_PANEL_ID}`)) {
        return;
      }
      if (active instanceof Element && active.closest(".ommm-dropdown-menu")) {
        return;
      }
      setSearchFocused(false);
    }, 0);
  }

  function handleSearchChange(value: string) {
    onSearchChange(value);
    if (value.length > 0) {
      setPanelOpen(false);
    }
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    searchInputRef.current?.blur();
    setSearchFocused(false);
  }

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
          portalFilterPanel && portaledPanelPosition
            ? {
                top: portaledPanelPosition.top,
                left: portaledPanelPosition.left,
                width: portaledPanelPosition.width,
                maxHeight: portaledPanelPosition.maxHeight,
                zIndex: OMMM_FLOATING_MENU_Z_INDEX,
                overflowY: "auto",
                overscrollBehavior: "contain",
                WebkitOverflowScrolling: "touch",
              }
            : undefined
        }
      >
        <IntegratedSearchFilterPanel
          fields={fields ?? []}
          filterValues={panelFilterValues}
          onFilterChange={(key, value) =>
            setDraftFilters((prev) => ({ ...prev, [key]: value }))
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
        containerRef={containerRef}
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
