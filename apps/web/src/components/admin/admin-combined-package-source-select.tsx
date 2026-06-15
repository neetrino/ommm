"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDownIcon } from "@/components/marketing/schedule/schedule-view-icons";
import { DropdownCheckGlyph } from "@/components/ui/dropdown-check-glyph";
import { useFloatingMenuPosition } from "@/components/ui/use-floating-menu-position";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import {
  getOmmmOverlayPortalRoot,
  OMMM_FLOATING_MENU_Z_INDEX,
} from "@/lib/ommm-overlay-portal";

export type CombinedPackageSourceOption = {
  id: string;
  label: string;
  categoryName: string;
};

type AdminCombinedPackageSourceSelectProps = {
  options: readonly CombinedPackageSourceOption[];
  selectedIds: readonly string[];
  onChange: (selectedIds: string[]) => void;
  disabled?: boolean;
};

const MENU_MIN_HEIGHT = 160;
const TRIGGER_MIN_WIDTH = 280;

export function AdminCombinedPackageSourceSelect({
  options,
  selectedIds,
  onChange,
  disabled = false,
}: AdminCombinedPackageSourceSelectProps) {
  const t = useTranslations("adminPages.packages.combinedForm");
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const portalReady = useIsClientMounted();

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedOptions = useMemo(
    () => options.filter((option) => selectedSet.has(option.id)),
    [options, selectedSet],
  );
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
    onChange([...next]);
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <div ref={rootRef} className="ommm-dropdown-root">
      <button
        ref={triggerRef}
        type="button"
        className="ommm-dropdown-trigger"
        data-open={isMenuOpen ? "true" : "false"}
        aria-label={t("sourceSelectLabel")}
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
        {selectedOptions.length === 0 ? (
          <span className="truncate text-sm font-medium text-sage-500">
            {t("sourceSelectPlaceholder")}
          </span>
        ) : (
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {selectedOptions.map((option) => (
              <span key={option.id} className="ommm-dropdown-chip">{option.label}</span>
            ))}
          </span>
        )}
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
                position: "fixed",
                zIndex: OMMM_FLOATING_MENU_Z_INDEX,
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
                maxHeight: menuPosition.maxHeight,
                transform: menuPosition.placement === "top" ? "translateY(-100%)" : undefined,
              }}
            >
              <div className="ommm-dropdown-menu-header">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#97907c]">
                  {t("sourceSelectLabel")}
                </p>
                <button
                  type="button"
                  className="ommm-dropdown-menu-action"
                  onClick={clearAll}
                  disabled={selectedOptions.length === 0}
                >
                  {t("sourceSelectClear")}
                </button>
              </div>
              <ul
                id={listboxId}
                role="listbox"
                aria-label={t("sourceSelectLabel")}
                aria-multiselectable="true"
                className="ommm-dropdown-menu-list"
                style={{ maxHeight: Math.max(96, menuPosition.maxHeight - 72) }}
              >
                {options.map((option) => {
                  const isSelected = selectedSet.has(option.id);
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
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                          <span className="truncate text-sm font-medium">{option.label}</span>
                          <span className="truncate text-xs text-sage-500">
                            {option.categoryName}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>,
            getOmmmOverlayPortalRoot(),
          )
        : null}
    </div>
  );
}
