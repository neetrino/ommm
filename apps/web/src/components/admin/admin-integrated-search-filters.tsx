"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AdminIntegratedSearchFilterChips } from "@/components/admin/admin-integrated-search-filter-chips";
import { AdminIntegratedSearchFilterPanel } from "@/components/admin/admin-integrated-search-filter-panel";
import {
  buildAdminIntegratedFilterChips,
  clearAdminIntegratedFilterValues,
  resolveAdminIntegratedFilterEmptyValue,
  type AdminIntegratedFilterField,
} from "@/components/admin/admin-integrated-search-filter-types";

const EMPTY_FILTER_VALUES: Record<string, string> = {};

const PANEL_ID = "admin-integrated-search-filter-panel";

const PANEL_POSITION_CLASS =
  "absolute top-[calc(100%+0.5rem)] left-0 z-50 w-[40rem] min-w-[24rem] max-w-[min(40rem,calc(100vw-2rem))]";

const PANEL_SURFACE_CLASS =
  "rounded-2xl border border-white/60 bg-white/95 p-4 shadow-[0_24px_50px_-30px_rgba(45,40,35,0.28)] backdrop-blur-md ring-1 ring-sage-700/10";

export type AdminIntegratedSearchFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  fields?: readonly AdminIntegratedFilterField[];
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
export function AdminIntegratedSearchFilters({
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
}: AdminIntegratedSearchFiltersProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [draftFilters, setDraftFilters] = useState(filterValues);
  const hasFilters = Boolean(fields?.length);

  const chips = useMemo(
    () => buildAdminIntegratedFilterChips(fields, filterValues),
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

  function handleRemoveChip(key: string) {
    const field = fields?.find((item) => item.key === key);
    if (!field || !onFilterChange) {
      return;
    }
    onFilterChange(key, resolveAdminIntegratedFilterEmptyValue(field));
  }

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
    const cleared = clearAdminIntegratedFilterValues(fields);
    setDraftFilters(cleared);
    onClearAll?.();
    onSearchChange("");
    setPanelOpen(false);
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

  function handleSearchBlur() {
    window.setTimeout(() => {
      const active = document.activeElement;
      if (containerRef.current?.contains(active)) {
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

  return (
    <div ref={containerRef} className={`relative w-full min-w-0 ${className}`}>
      <div
        className={`flex min-h-11 w-full min-w-0 items-center gap-2 rounded-full border border-white/60 bg-[rgba(192,187,176,0.32)] px-2 shadow-none transition-shadow ${
          showQueryRing || showPanelRing ? "ring-2 ring-sand-500/35" : ""
        } ${searchFocused ? "bg-[rgba(192,187,176,0.42)]" : ""}`}
      >
        <AdminIntegratedSearchFilterChips chips={chips} onRemove={handleRemoveChip} />
        {hideSearch ? (
          hasFilters ? (
            <button
              type="button"
              className="ommm-admin-header-search flex h-9 min-w-0 flex-1 items-center px-3 text-left text-sm text-sage-600"
              onClick={openPanel}
              aria-expanded={panelOpen}
              aria-controls={PANEL_ID}
            >
              {searchPlaceholder}
            </button>
          ) : null
        ) : (
          <div className="relative min-w-0 flex-1">
            <SearchGlyph className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-sage-500" />
            <input
              type="search"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              onFocus={openPanel}
              onClick={openPanel}
              onBlur={handleSearchBlur}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              role="searchbox"
              aria-expanded={hasFilters ? panelOpen : undefined}
              aria-controls={hasFilters ? PANEL_ID : undefined}
              className="ommm-admin-header-search h-9 w-full border-0 bg-transparent pl-9 pr-2 shadow-none focus-visible:outline-none focus-visible:ring-0"
            />
          </div>
        )}
        {hasQuery ? (
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

      {hasFilters && panelOpen ? (
        <div
          id={PANEL_ID}
          role="dialog"
          aria-label={filterPanelAriaLabel}
          className={`${PANEL_POSITION_CLASS} ${PANEL_SURFACE_CLASS}`}
        >
          <AdminIntegratedSearchFilterPanel
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
      ) : null}
    </div>
  );
}
