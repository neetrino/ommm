"use client";

import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/marketing/schedule/schedule-view-icons";
import { DropdownCheckGlyph } from "@/components/ui/dropdown-check-glyph";
import { useFloatingMenuPosition } from "@/components/ui/use-floating-menu-position";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import {
  findMatchingPackageCategory,
  normalizePackageCategoryKey,
  normalizePackageCategoryLabel,
} from "@/components/admin/package-category-utils";

export type AdminPackageCategoryOption = {
  id: string;
  label: string;
};

type AdminPackageCategorySelectProps = {
  value: string;
  options: readonly AdminPackageCategoryOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  loading?: boolean;
  ariaLabel: string;
};

type MenuRow =
  | { kind: "existing"; label: string }
  | { kind: "create"; label: string };

function mergeClasses(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function AdminPackageCategorySelect({
  value,
  options,
  onChange,
  disabled = false,
  required = false,
  loading = false,
  ariaLabel,
}: AdminPackageCategorySelectProps) {
  const t = useTranslations("adminPages.packages");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const portalReady = useIsClientMounted();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listboxId = useId();
  const queryInputId = useId();

  const optionLabels = useMemo(
    () => options.map((option) => option.label),
    [options],
  );

  const menuRows = useMemo((): MenuRow[] => {
    const trimmedQuery = normalizePackageCategoryLabel(query);
    const queryKey = normalizePackageCategoryKey(trimmedQuery);
    const filtered = optionLabels.filter((label) => {
      if (queryKey.length === 0) {
        return true;
      }
      return normalizePackageCategoryKey(label).includes(queryKey);
    });
    const rows: MenuRow[] = filtered.map((label) => ({
      kind: "existing",
      label,
    }));
    if (
      trimmedQuery.length > 0 &&
      findMatchingPackageCategory(trimmedQuery, optionLabels) === null
    ) {
      rows.push({ kind: "create", label: trimmedQuery });
    }
    return rows;
  }, [optionLabels, query]);

  const selectedLabel = useMemo(() => {
    const trimmedValue = normalizePackageCategoryLabel(value);
    if (trimmedValue.length === 0) {
      return "";
    }
    return findMatchingPackageCategory(trimmedValue, optionLabels) ?? trimmedValue;
  }, [optionLabels, value]);

  const isMenuOpen = open && !disabled && !loading;
  const menuPosition = useFloatingMenuPosition(triggerRef, isMenuOpen, disabled);

  useEffect(() => {
    if (!open || disabled) {
      return undefined;
    }
    const closeOnOutside = (event: MouseEvent | TouchEvent) => {
      if (!(event.target instanceof Node)) {
        return;
      }
      const clickedRoot = rootRef.current?.contains(event.target) ?? false;
      const clickedMenu = menuRef.current?.contains(event.target) ?? false;
      if (!clickedRoot && !clickedMenu) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("touchstart", closeOnOutside);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("touchstart", closeOnOutside);
    };
  }, [disabled, open]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }
    optionRefs.current[focusedIndex]?.focus();
  }, [focusedIndex, isMenuOpen]);

  function closeMenu() {
    setOpen(false);
    setQuery("");
    window.requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }

  function openMenu() {
    if (disabled || loading) {
      return;
    }
    setQuery(selectedLabel);
    setFocusedIndex(0);
    setOpen(true);
  }

  function selectLabel(label: string) {
    onChange(normalizePackageCategoryLabel(label));
    closeMenu();
  }

  function onOptionKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
    row: MenuRow,
  ) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedIndex((index + 1) % menuRows.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedIndex((index - 1 + menuRows.length) % menuRows.length);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setFocusedIndex(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setFocusedIndex(menuRows.length - 1);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectLabel(row.label);
    }
  }

  const triggerText =
    selectedLabel.length > 0 ? selectedLabel : t("fieldCategoryPlaceholder");

  return (
    <div ref={rootRef} className="ommm-dropdown-root">
      <button
        ref={triggerRef}
        type="button"
        className={mergeClasses(
          "ommm-dropdown-trigger",
          selectedLabel.length === 0 ? "text-sage-400" : undefined,
        )}
        data-open={isMenuOpen ? "true" : "false"}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isMenuOpen}
        aria-controls={listboxId}
        disabled={disabled || loading}
        onClick={() => (isMenuOpen ? closeMenu() : openMenu())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openMenu();
          }
        }}
      >
        <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-[#464646]">
          {loading ? t("categoryLoading") : triggerText}
        </span>
        <span className="ml-auto shrink-0 text-sage-500">
          <ChevronDownIcon />
        </span>
      </button>

      {isMenuOpen && menuPosition !== null && portalReady && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              className="ommm-dropdown-menu"
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
                maxHeight: menuPosition.maxHeight,
                transform: menuPosition.placement === "top" ? "translateY(-100%)" : undefined,
              }}
            >
              <div className="border-b border-white/70 px-3 py-2">
                <label htmlFor={queryInputId} className="sr-only">
                  {t("categorySearchLabel")}
                </label>
                <input
                  id={queryInputId}
                  type="text"
                  className="ommm-input h-9 text-sm"
                  value={query}
                  placeholder={t("categorySearchPlaceholder")}
                  autoComplete="off"
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setFocusedIndex(0);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown" && menuRows.length > 0) {
                      event.preventDefault();
                      optionRefs.current[0]?.focus();
                    }
                    if (event.key === "Enter" && menuRows.length > 0) {
                      event.preventDefault();
                      selectLabel(menuRows[0]?.label ?? query);
                    }
                  }}
                />
              </div>
              <ul
                id={listboxId}
                role="listbox"
                aria-label={ariaLabel}
                aria-required={required ? true : undefined}
                className="ommm-dropdown-menu-list"
                style={{ maxHeight: Math.max(96, menuPosition.maxHeight - 64) }}
              >
                {menuRows.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-sage-500" role="presentation">
                    {t("categoryNoMatches")}
                  </li>
                ) : (
                  menuRows.map((row, index) => {
                    const isSelected =
                      row.kind === "existing" &&
                      normalizePackageCategoryKey(row.label) ===
                        normalizePackageCategoryKey(selectedLabel);
                    return (
                      <li key={`${row.kind}-${row.label}`} role="presentation">
                        <button
                          ref={(node) => {
                            optionRefs.current[index] = node;
                          }}
                          type="button"
                          role="option"
                          tabIndex={index === focusedIndex ? 0 : -1}
                          aria-selected={isSelected}
                          className={mergeClasses(
                            "ommm-dropdown-option",
                            row.kind === "create" ? "ommm-dropdown-option-custom" : undefined,
                          )}
                          data-selected={isSelected ? "true" : "false"}
                          onClick={() => selectLabel(row.label)}
                          onKeyDown={(event) => onOptionKeyDown(event, index, row)}
                        >
                          {row.kind === "create" ? (
                            <span className="min-w-0 flex-1 text-left text-sm">
                              <span className="font-medium text-sand-700">
                                {t("categoryCreateOption", { name: row.label })}
                              </span>
                              <span className="mt-0.5 block text-xs text-sage-500">
                                {t("categoryCreateHint")}
                              </span>
                            </span>
                          ) : (
                            <>
                              <span
                                className="ommm-dropdown-checkbox"
                                data-checked={isSelected ? "true" : "false"}
                                aria-hidden
                              >
                                {isSelected ? <DropdownCheckGlyph className="h-3 w-3" /> : null}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-sm">{row.label}</span>
                            </>
                          )}
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>,
            document.body,
          )
        : null}

      <input type="hidden" name="categoryName" value={value} required={required} />
    </div>
  );
}
