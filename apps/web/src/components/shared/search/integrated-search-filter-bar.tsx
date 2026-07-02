"use client";

import type { RefObject } from "react";
import { IntegratedSearchFilterChips } from "@/components/shared/search/integrated-search-filter-chips";
import {
  IntegratedSearchFilterClearGlyph,
  IntegratedSearchFilterGlyph,
  IntegratedSearchFilterSearchGlyph,
} from "@/components/shared/search/integrated-search-filters-icons";
import {
  INTEGRATED_SEARCH_FILTER_PANEL_ID,
} from "@/components/shared/search/integrated-search-filters.constants";
import type { IntegratedFilterChip } from "@/components/shared/search/integrated-search-filter-types";

type IntegratedSearchFilterBarProps = {
  containerRef: RefObject<HTMLDivElement | null>;
  searchInputRef: RefObject<HTMLInputElement | null>;
  hideSearch: boolean;
  hasFilters: boolean;
  panelOpen: boolean;
  searchFocused: boolean;
  search: string;
  searchPlaceholder: string;
  visibleChips: readonly IntegratedFilterChip[];
  showClearButton: boolean;
  showQueryRing: boolean;
  showPanelRing: boolean;
  filterToggleAriaLabel: string;
  clearAriaLabel: string;
  onFilterToggleClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onBarPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onFilterBarClick: () => void;
  onFilterBarKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  onSearchChange: (value: string) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  onSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onReset: () => void;
  onOpenFilterPanel: () => void;
  onRemoveChip: (key: string) => void;
  canRemoveChip: boolean;
};

export function IntegratedSearchFilterBar({
  containerRef: _containerRef,
  searchInputRef,
  hideSearch,
  hasFilters,
  panelOpen,
  searchFocused,
  search,
  searchPlaceholder,
  visibleChips,
  showClearButton,
  showQueryRing,
  showPanelRing,
  filterToggleAriaLabel,
  clearAriaLabel,
  onFilterToggleClick,
  onBarPointerDown,
  onFilterBarClick,
  onFilterBarKeyDown,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onSearchKeyDown,
  onReset,
  onOpenFilterPanel,
  onRemoveChip,
  canRemoveChip,
}: IntegratedSearchFilterBarProps) {
  const barClickable = hideSearch && hasFilters;
  const barIsPrimaryButton = barClickable && visibleChips.length === 0;

  return (
    <div
      role={barIsPrimaryButton ? "button" : undefined}
      tabIndex={barIsPrimaryButton ? 0 : undefined}
      aria-expanded={barClickable ? panelOpen : undefined}
      aria-controls={barClickable ? INTEGRATED_SEARCH_FILTER_PANEL_ID : undefined}
      onClick={barClickable ? onFilterBarClick : undefined}
      onKeyDown={barIsPrimaryButton ? onFilterBarKeyDown : undefined}
      onPointerDown={hideSearch ? undefined : onBarPointerDown}
      className={`flex min-h-11 w-full min-w-0 items-center gap-2 rounded-full border border-white/60 bg-[rgba(192,187,176,0.32)] px-2 shadow-none transition-shadow ${
        panelOpen && hasFilters ? "relative z-[127] bg-[rgba(192,187,176,0.42)]" : ""
      } ${showQueryRing || showPanelRing ? "ring-2 ring-sand-500/35" : ""} ${
        !panelOpen && searchFocused ? "bg-[rgba(192,187,176,0.42)]" : ""
      } ${barClickable ? "cursor-pointer" : ""}`}
    >
      {hideSearch && hasFilters && visibleChips.length === 0 ? (
        <span className="flex h-9 min-w-0 flex-1 items-center px-1 text-sm text-sage-600">
          {searchPlaceholder}
        </span>
      ) : null}
      {hideSearch && visibleChips.length > 0 ? (
        <IntegratedSearchFilterChips
          chips={visibleChips}
          onActivate={hasFilters ? onOpenFilterPanel : undefined}
          onRemove={canRemoveChip ? onRemoveChip : undefined}
        />
      ) : null}
      {!hideSearch ? (
        <div className="relative min-w-0 flex-1">
          <IntegratedSearchFilterSearchGlyph className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-sage-500" />
          {hasFilters ? (
            <button
              type="button"
              className={`absolute top-1/2 right-1.5 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full transition-colors hover:bg-white/50 ${
                panelOpen
                  ? "bg-white/50 text-sage-900"
                  : visibleChips.length > 0
                    ? "text-sage-700"
                    : "text-sage-500"
              }`}
              aria-label={filterToggleAriaLabel}
              aria-expanded={panelOpen}
              aria-controls={INTEGRATED_SEARCH_FILTER_PANEL_ID}
              onClick={onFilterToggleClick}
            >
              <IntegratedSearchFilterGlyph className="h-4 w-4 shrink-0" />
            </button>
          ) : null}
          <input
            ref={searchInputRef}
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            onFocus={onSearchFocus}
            onClick={onSearchFocus}
            onKeyDown={onSearchKeyDown}
            onBlur={onSearchBlur}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            role={hasFilters ? "combobox" : "searchbox"}
            aria-expanded={hasFilters ? panelOpen : undefined}
            aria-controls={hasFilters ? INTEGRATED_SEARCH_FILTER_PANEL_ID : undefined}
            className={`ommm-search-input-no-native-clear h-9 w-full min-w-0 border-0 bg-transparent pl-9 text-sm text-sage-700 placeholder:text-sage-500/70 shadow-none focus-visible:outline-none focus-visible:ring-0 ${
              hasFilters ? "pr-10" : "pr-2"
            }`}
          />
        </div>
      ) : null}
      {showClearButton ? (
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sage-600 transition-colors hover:bg-white/50 hover:text-sage-900"
          aria-label={clearAriaLabel}
          onClick={onReset}
        >
          <IntegratedSearchFilterClearGlyph className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
