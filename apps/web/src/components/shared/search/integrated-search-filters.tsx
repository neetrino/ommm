"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { IntegratedSearchFilterChips } from "@/components/shared/search/integrated-search-filter-chips";
import { IntegratedSearchFilterPanel } from "@/components/shared/search/integrated-search-filter-panel";
import {
  buildIntegratedFilterChips,
  clearIntegratedFilterValues,
  resolveIntegratedFilterEmptyValue,
  type IntegratedFilterField,
} from "@/components/shared/search/integrated-search-filter-types";

const EMPTY_FILTER_VALUES: Record<string, string> = {};

const PANEL_ID = "integrated-search-filter-panel";

const PANEL_POSITION_CLASS =
  "absolute top-[calc(100%+0.5rem)] left-0 z-50 w-[40rem] min-w-[24rem] max-w-[min(40rem,calc(100vw-2rem))]";

const PANEL_SURFACE_CLASS =
  "rounded-2xl border border-white/60 bg-white/95 p-4 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] backdrop-blur-md ring-1 ring-sage-700/10";

const PANEL_GAP_PX = 8;
const PANEL_MIN_WIDTH_PX = 384;
const PANEL_MAX_WIDTH_PX = 640;

function usePortaledFilterPanelPosition(
  containerRef: RefObject<HTMLDivElement | null>,
  panelOpen: boolean,
  enabled: boolean,
): { top: number; left: number; width: number } | null {
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );
  const panelEnabled = enabled && panelOpen;

  useEffect(() => {
    if (!panelEnabled) {
      return undefined;
    }

    const update = (): void => {
      const element = containerRef.current;
      if (element === null) {
        return;
      }
      const rect = element.getBoundingClientRect();
      const width = Math.min(PANEL_MAX_WIDTH_PX, Math.max(rect.width, PANEL_MIN_WIDTH_PX));
      const left = Math.min(rect.left, window.innerWidth - width - PANEL_GAP_PX);
      setPosition({ top: rect.bottom + PANEL_GAP_PX, left, width });
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [containerRef, panelEnabled]);

  const resolvedPosition = panelEnabled ? position : null;
  return resolvedPosition;
}

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
  className?: string;
  /** When true, omits the text search input — filter panel opens via filter button (overview period-only). */
  hideSearch?: boolean;
  /** Renders the filter panel in a body portal (sticky headers + tab layouts). */
  portalFilterPanel?: boolean;
};

function SearchGlyph({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.85}
      className={className}
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

/** Compact search bar — filter panel opens on focus when search is empty (NBOS pattern). */
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
  className = "",
  hideSearch = false,
  portalFilterPanel = true,
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
  const hasQuery = search.trim().length > 0 || chips.length > 0;
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
      if (target.closest(`#${PANEL_ID}`)) {
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

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
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
    searchInputRef.current?.focus();
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

  function openPanel() {
    setSearchFocused(true);
    if (!hasFilters) {
      return;
    }
    if (!hideSearch && search.trim().length > 0) {
      return;
    }
    setDraftFilters(filterValues);
    setPanelOpen(true);
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

  const showClearButton = hideSearch ? chips.length > 0 : hasQuery;

  function handleSearchBlur() {
    window.setTimeout(() => {
      const active = document.activeElement;
      if (containerRef.current?.contains(active)) {
        return;
      }
      if (active instanceof Element && active.closest(`#${PANEL_ID}`)) {
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

  const filterPanel =
    hasFilters && panelOpen ? (
      <div
        id={PANEL_ID}
        role="dialog"
        aria-label={filterPanelAriaLabel}
        className={
          portalFilterPanel
            ? `fixed z-[120] ${PANEL_SURFACE_CLASS}`
            : `${PANEL_POSITION_CLASS} ${PANEL_SURFACE_CLASS}`
        }
        style={
          portalFilterPanel && portaledPanelPosition
            ? {
                top: portaledPanelPosition.top,
                left: portaledPanelPosition.left,
                width: portaledPanelPosition.width,
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

  const barClickable = hideSearch && hasFilters;
  const barIsPrimaryButton = barClickable && chips.length === 0;

  return (
    <div ref={containerRef} className={`relative w-full min-w-0 ${className}`}>
      <div
        role={barIsPrimaryButton ? "button" : undefined}
        tabIndex={barIsPrimaryButton ? 0 : undefined}
        aria-expanded={barClickable ? panelOpen : undefined}
        aria-controls={barClickable ? PANEL_ID : undefined}
        onClick={barClickable ? handleFilterBarClick : undefined}
        onKeyDown={barIsPrimaryButton ? handleFilterBarKeyDown : undefined}
        onPointerDown={hideSearch ? undefined : handleBarPointerDown}
        className={`flex min-h-11 w-full min-w-0 items-center gap-2 rounded-full border border-white/60 bg-[rgba(192,187,176,0.32)] px-2 shadow-none transition-shadow ${
          showQueryRing || showPanelRing ? "ring-2 ring-sand-500/35" : ""
        } ${searchFocused ? "bg-[rgba(192,187,176,0.42)]" : ""} ${
          barClickable ? "cursor-pointer" : ""
        }`}
      >
        <IntegratedSearchFilterChips
          chips={chips}
          onActivate={hasFilters ? openPanel : undefined}
          onRemove={onFilterChange ? handleRemoveChip : undefined}
        />
        {hideSearch && hasFilters && chips.length === 0 ? (
          <span className="flex h-9 min-w-0 flex-1 items-center px-1 text-sm text-sage-600">
            {searchPlaceholder}
          </span>
        ) : null}
        {!hideSearch ? (
          <div className="relative min-w-0 flex-1">
            <SearchGlyph className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-sage-500" />
            <input
              ref={searchInputRef}
              type="search"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              onFocus={openPanel}
              onClick={openPanel}
              onBlur={handleSearchBlur}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              role={hasFilters ? "combobox" : "searchbox"}
              aria-expanded={hasFilters ? panelOpen : undefined}
              aria-controls={hasFilters ? PANEL_ID : undefined}
              className="ommm-search-input-no-native-clear h-9 w-full min-w-0 border-0 bg-transparent pl-9 pr-2 text-sm text-sage-700 placeholder:text-sage-500/70 shadow-none focus-visible:outline-none focus-visible:ring-0"
            />
          </div>
        ) : null}
        {showClearButton ? (
          <button
            type="button"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sage-600 transition-colors hover:bg-white/50 hover:text-sage-900"
            aria-label={clearAriaLabel}
            onClick={handleReset}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4"
              aria-hidden
            >
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        ) : null}
      </div>

      {portalFilterPanel && filterPanel && typeof document !== "undefined"
        ? createPortal(filterPanel, document.body)
        : filterPanel}
    </div>
  );
}
