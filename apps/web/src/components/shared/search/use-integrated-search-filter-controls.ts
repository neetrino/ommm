"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearIntegratedFilterValues,
  resolveIntegratedFilterEmptyValue,
  type IntegratedFilterField,
} from "@/components/shared/search/integrated-search-filter-types";
import { INTEGRATED_SEARCH_FILTER_PANEL_ID } from "@/components/shared/search/integrated-search-filters.constants";

type UseIntegratedSearchFilterControlsOptions = {
  hideSearch: boolean;
  hasFilters: boolean;
  fields: readonly IntegratedFilterField[] | undefined;
  filterValues: Record<string, string>;
  onSearchChange: (value: string) => void;
  onFilterChange?: (key: string, value: string) => void;
  onClearAll?: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
};

export function useIntegratedSearchFilterControls({
  hideSearch,
  hasFilters,
  fields,
  filterValues,
  onSearchChange,
  onFilterChange,
  onClearAll,
  containerRef,
  searchInputRef,
}: UseIntegratedSearchFilterControlsOptions) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [draftFilters, setDraftFilters] = useState(filterValues);

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
  }, [containerRef, panelOpen]);

  const handleApply = useCallback(() => {
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
  }, [draftFilters, fields, filterValues, onFilterChange]);

  const handleReset = useCallback(() => {
    const cleared = clearIntegratedFilterValues(fields);
    setDraftFilters(cleared);
    onClearAll?.();
    onSearchChange("");
    setPanelOpen(false);
  }, [fields, onClearAll, onSearchChange]);

  const handleRemoveChip = useCallback(
    (key: string) => {
      if (!onFilterChange || !fields) {
        return;
      }
      const field = fields.find((item) => item.key === key);
      if (!field) {
        return;
      }
      onFilterChange(key, resolveIntegratedFilterEmptyValue(field));
    },
    [fields, onFilterChange],
  );

  const focusSearchField = useCallback(() => {
    if (hideSearch) {
      return;
    }
    setPanelOpen(false);
    searchInputRef.current?.focus();
  }, [hideSearch, searchInputRef]);

  const handleSearchFocus = useCallback(() => {
    setSearchFocused(true);
    setPanelOpen(false);
  }, []);

  const openFilterPanel = useCallback(() => {
    if (!hasFilters) {
      return;
    }
    searchInputRef.current?.blur();
    setDraftFilters(filterValues);
    setPanelOpen(true);
  }, [filterValues, hasFilters, searchInputRef]);

  const toggleFilterPanel = useCallback(() => {
    if (!hasFilters) {
      return;
    }
    if (panelOpen) {
      setPanelOpen(false);
      return;
    }
    openFilterPanel();
  }, [hasFilters, openFilterPanel, panelOpen]);

  const handleFilterToggleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      toggleFilterPanel();
    },
    [toggleFilterPanel],
  );

  const handleBarPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
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
    },
    [focusSearchField, hideSearch, searchInputRef],
  );

  const handleFilterBarClick = useCallback(() => {
    if (hideSearch && hasFilters) {
      openFilterPanel();
    }
  }, [hasFilters, hideSearch, openFilterPanel]);

  const handleFilterBarKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!hideSearch || !hasFilters) {
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openFilterPanel();
      }
    },
    [hasFilters, hideSearch, openFilterPanel],
  );

  const handleSearchBlur = useCallback(() => {
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
  }, [containerRef]);

  const handleSearchChange = useCallback(
    (value: string) => {
      onSearchChange(value);
      if (value.length > 0) {
        setPanelOpen(false);
      }
    },
    [onSearchChange],
  );

  const handleSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") {
        return;
      }
      event.preventDefault();
      searchInputRef.current?.blur();
      setSearchFocused(false);
    },
    [searchInputRef],
  );

  return {
    panelOpen,
    searchFocused,
    draftFilters,
    setDraftFilters,
    panelFilterValues: panelOpen ? draftFilters : filterValues,
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
  };
}
