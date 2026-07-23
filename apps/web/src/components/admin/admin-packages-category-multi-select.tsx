"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDownIcon } from "@/components/marketing/schedule/schedule-view-icons";
import { DropdownCheckGlyph } from "@/components/ui/dropdown-check-glyph";
import { useFloatingMenuPosition } from "@/components/ui/use-floating-menu-position";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";

export type AdminPackagesCategoryOption = {
  id: string;
  label: string;
};

type AdminPackagesCategoryMultiSelectProps = {
  options: readonly AdminPackagesCategoryOption[];
  selectedIds: ReadonlySet<string>;
  onChange: (selectedIds: ReadonlySet<string>) => void;
  disabled?: boolean;
};

const MENU_MIN_HEIGHT = 140;
const TRIGGER_MIN_WIDTH = 280;

function buildSelectionFromIds(
  options: readonly AdminPackagesCategoryOption[],
  selectedIds: ReadonlySet<string>,
): ReadonlySet<string> {
  const validIds = new Set(options.map((option) => option.id));
  return new Set([...selectedIds].filter((id) => validIds.has(id)));
}

/** Multi-select category filter for Admin → Packages. */
export function AdminPackagesCategoryMultiSelect({
  options,
  selectedIds,
  onChange,
  disabled = false,
}: AdminPackagesCategoryMultiSelectProps) {
  const t = useTranslations("adminPages.packages.filters");
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const portalReady = useIsClientMounted();

  const selectedOptions = useMemo(
    () => options.filter((option) => selectedIds.has(option.id)),
    [options, selectedIds],
  );
  const allSelected = options.length > 0 && selectedOptions.length === options.length;
  const isMenuOpen = open && !disabled && options.length > 0;
  const menuPosition = useFloatingMenuPosition(
    triggerRef,
    isMenuOpen,
    disabled,
    MENU_MIN_HEIGHT,
    TRIGGER_MIN_WIDTH,
  );

  useEffect(() => {
    if (!open || disabled) {
      return undefined;
    }
    const closeOnOutside = (event: MouseEvent | TouchEvent) => {
      if (!(event.target instanceof Node)) {
        return;
      }
      const clickedTrigger = rootRef.current?.contains(event.target) ?? false;
      const clickedMenu = menuRef.current?.contains(event.target) ?? false;
      if (!clickedTrigger && !clickedMenu) {
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

  function closeAndFocusTrigger() {
    setOpen(false);
    window.requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }

  function toggleOption(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onChange(buildSelectionFromIds(options, next));
  }

  function selectAll() {
    onChange(new Set(options.map((option) => option.id)));
  }

  function clearAll() {
    onChange(new Set());
  }

  function renderTriggerContent() {
    if (selectedOptions.length === 0) {
      return (
        <span className="truncate text-sm font-medium text-sage-500">{t("categoriesNone")}</span>
      );
    }
    if (allSelected) {
      return (
        <span className="truncate text-sm font-semibold text-[#464646]">
          {t("categoriesAll", { count: options.length })}
        </span>
      );
    }
    return (
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        {selectedOptions.map((option) => (
          <span key={option.id} className="ommm-dropdown-chip">
            {option.label}
          </span>
        ))}
      </span>
    );
  }

  return (
    <div ref={rootRef} className="ommm-dropdown-root ommm-admin-packages-category-filter">
      <button
        ref={triggerRef}
        type="button"
        className="ommm-dropdown-trigger"
        data-open={isMenuOpen ? "true" : "false"}
        aria-label={t("categoriesLabel")}
        aria-haspopup="listbox"
        aria-expanded={isMenuOpen}
        aria-controls={listboxId}
        disabled={disabled || options.length === 0}
        onClick={() => (isMenuOpen ? closeAndFocusTrigger() : setOpen(true))}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!disabled && options.length > 0) {
              setOpen(true);
            }
          }
          if (event.key === "Escape" && isMenuOpen) {
            event.preventDefault();
            closeAndFocusTrigger();
          }
        }}
      >
        {renderTriggerContent()}
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
              <div className="ommm-dropdown-menu-header">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#97907c]">
                  {t("categoriesLabel")}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="ommm-dropdown-menu-action"
                    onClick={selectAll}
                    disabled={allSelected}
                  >
                    {t("categoriesSelectAll")}
                  </button>
                  <button
                    type="button"
                    className="ommm-dropdown-menu-action"
                    onClick={clearAll}
                    disabled={selectedOptions.length === 0}
                  >
                    {t("categoriesClearAll")}
                  </button>
                </div>
              </div>
              <ul
                id={listboxId}
                role="listbox"
                aria-label={t("categoriesLabel")}
                aria-multiselectable="true"
                className="ommm-dropdown-menu-list"
                style={{ maxHeight: Math.max(96, menuPosition.maxHeight - 72) }}
              >
                {options.map((option) => {
                  const isSelected = selectedIds.has(option.id);
                  return (
                    <li key={option.id} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className="ommm-dropdown-option"
                        data-selected={isSelected ? "true" : "false"}
                        onClick={() => toggleOption(option.id)}
                      >
                        <span
                          className="ommm-dropdown-checkbox"
                          data-checked={isSelected ? "true" : "false"}
                          aria-hidden
                        >
                          {isSelected ? <DropdownCheckGlyph className="h-3 w-3" /> : null}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{option.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

/** Default selection — all categories. */
export function allPackageCategoryIds(
  options: readonly AdminPackagesCategoryOption[],
): ReadonlySet<string> {
  return new Set(options.map((option) => option.id));
}

/** Keeps selection valid; defaults to all categories when options appear or selection is empty. */
export function syncPackageCategorySelection(
  options: readonly AdminPackagesCategoryOption[],
  previousOptions: readonly AdminPackagesCategoryOption[],
  selectedIds: ReadonlySet<string>,
): ReadonlySet<string> {
  if (options.length === 0) {
    return new Set();
  }

  const hadAllSelected =
    previousOptions.length > 0 &&
    previousOptions.every((option) => selectedIds.has(option.id));
  const isFirstCategoryLoad = previousOptions.length === 0;
  const filtered = buildSelectionFromIds(options, selectedIds);

  if (isFirstCategoryLoad || hadAllSelected || filtered.size === 0) {
    return allPackageCategoryIds(options);
  }

  return filtered;
}
