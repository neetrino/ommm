"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDownIcon } from "@/components/marketing/schedule/schedule-view-icons";
import { DropdownCheckGlyph } from "@/components/ui/dropdown-check-glyph";
import { useFloatingMenuPosition } from "@/components/ui/use-floating-menu-position";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import {
  getOmmmOverlayPortalRoot,
  OMMM_FLOATING_MENU_Z_INDEX,
} from "@/lib/ommm-overlay-portal";

export type OmmFilterMultiSelectOption = {
  value: string;
  label: string;
};

export type OmmFilterMultiSelectVariant = "default" | "accent";

export type OmmFilterMultiSelectProps = {
  ariaLabel: string;
  allLabel: string;
  options: readonly OmmFilterMultiSelectOption[];
  selectedValues: readonly string[];
  onChange: (selectedValues: string[]) => void;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  wrapLabel?: boolean;
  /** Visual emphasis for quick-filter controls vs standard filter dropdowns. */
  variant?: OmmFilterMultiSelectVariant;
  /** Formats trigger text when more than one value is selected. Defaults to “{count} selected”. */
  formatSelectedCount?: (count: number) => string;
};

const MENU_MIN_HEIGHT = 140;
const TRIGGER_MIN_WIDTH = 220;

function mergeClasses(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function optionLabelClassName(wrapLabel: boolean): string {
  return wrapLabel
    ? "min-w-0 flex-1 whitespace-normal break-words leading-snug"
    : "min-w-0 flex-1 truncate";
}

function buildValidSelection(
  options: readonly OmmFilterMultiSelectOption[],
  selectedValues: readonly string[],
): string[] {
  const validValues = new Set(options.map((option) => option.value));
  return selectedValues.filter((value) => validValues.has(value));
}

function defaultSelectedCountLabel(count: number): string {
  return `${count} selected`;
}

export function OmmFilterMultiSelect({
  ariaLabel,
  allLabel,
  options,
  selectedValues,
  onChange,
  disabled = false,
  className,
  triggerClassName,
  wrapLabel = false,
  variant = "default",
  formatSelectedCount = defaultSelectedCountLabel,
}: OmmFilterMultiSelectProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const portalReady = useIsClientMounted();

  const normalizedSelection = useMemo(
    () => buildValidSelection(options, selectedValues),
    [options, selectedValues],
  );
  const isAllSelected = normalizedSelection.length === 0;
  const selectedOptions = useMemo(
    () => options.filter((option) => normalizedSelection.includes(option.value)),
    [normalizedSelection, options],
  );
  const isMenuOpen = open && !disabled;
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

  function selectAll() {
    onChange([]);
  }

  function toggleOption(value: string) {
    const next = new Set(normalizedSelection);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    onChange([...next]);
  }

  function wrapAccentLabel(content: ReactNode): ReactNode {
    if (variant !== "accent") {
      return content;
    }
    return <span className="ommm-dropdown-trigger-label min-w-0 flex-1">{content}</span>;
  }

  function renderTriggerContent(): ReactNode {
    if (isAllSelected) {
      if (variant === "accent") {
        return wrapAccentLabel(
          <span
            className={mergeClasses(
              optionLabelClassName(false),
              "text-sm font-semibold",
            )}
          >
            {allLabel}
          </span>,
        );
      }
      return (
        <span
          className={mergeClasses(
            optionLabelClassName(wrapLabel),
            "text-sm font-semibold text-[#464646]",
          )}
        >
          {allLabel}
        </span>
      );
    }
    if (selectedOptions.length >= 1) {
      if (variant === "accent") {
        return wrapAccentLabel(
          <span
            className={mergeClasses(
              optionLabelClassName(wrapLabel),
              "text-sm font-semibold",
            )}
          >
            {formatSelectedCount(selectedOptions.length)}
          </span>,
        );
      }
      if (selectedOptions.length === 1) {
        const label = selectedOptions[0]?.label ?? "";
        return (
          <span
            className={mergeClasses(
              optionLabelClassName(wrapLabel),
              "text-sm font-semibold text-[#464646]",
            )}
          >
            {label}
          </span>
        );
      }
    }
    return (
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#464646]">
        {formatSelectedCount(selectedOptions.length)}
      </span>
    );
  }

  const triggerAriaLabel =
    selectedOptions.length === 0
      ? ariaLabel
      : selectedOptions.length === 1
        ? `${ariaLabel}: ${selectedOptions[0]?.label ?? ""}`
        : `${ariaLabel}: ${formatSelectedCount(selectedOptions.length)}`;

  return (
    <div
      ref={rootRef}
      className={mergeClasses(
        "ommm-dropdown-root min-w-0",
        variant === "accent" ? "w-full min-w-[14rem] max-w-sm" : undefined,
        className,
      )}
    >
      <p className="sr-only">{ariaLabel}</p>
      <button
        ref={triggerRef}
        type="button"
        className={mergeClasses(
          "ommm-dropdown-trigger",
          variant === "accent" ? "ommm-dropdown-trigger--accent" : undefined,
          triggerClassName,
        )}
        data-open={isMenuOpen ? "true" : "false"}
        data-active={!isAllSelected ? "true" : "false"}
        aria-label={triggerAriaLabel}
        aria-haspopup="listbox"
        aria-expanded={isMenuOpen}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => (isMenuOpen ? closeAndFocusTrigger() : setOpen(true))}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!disabled) {
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
        <span
          className={mergeClasses(
            "ml-auto shrink-0",
            variant === "accent"
              ? "ommm-dropdown-trigger-chevron"
              : "text-sage-500",
          )}
        >
          <ChevronDownIcon />
        </span>
      </button>

      {isMenuOpen && menuPosition !== null && portalReady && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              className="ommm-dropdown-menu"
              style={{
                zIndex: OMMM_FLOATING_MENU_Z_INDEX,
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
                maxHeight: menuPosition.maxHeight,
                transform: menuPosition.placement === "top" ? "translateY(-100%)" : undefined,
              }}
            >
              <ul
                id={listboxId}
                role="listbox"
                aria-label={ariaLabel}
                aria-multiselectable="true"
                className="ommm-dropdown-menu-list"
                style={{ maxHeight: Math.max(96, menuPosition.maxHeight - 16) }}
              >
                <li role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isAllSelected}
                    className="ommm-dropdown-option"
                    data-selected={isAllSelected ? "true" : "false"}
                    onClick={selectAll}
                  >
                    <span
                      className="ommm-dropdown-checkbox"
                      data-checked={isAllSelected ? "true" : "false"}
                      aria-hidden
                    >
                      {isAllSelected ? <DropdownCheckGlyph className="h-3 w-3" /> : null}
                    </span>
                    <span className={optionLabelClassName(wrapLabel)}>{allLabel}</span>
                  </button>
                </li>
                {options.map((option) => {
                  const isSelected = normalizedSelection.includes(option.value);
                  return (
                    <li key={option.value} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className="ommm-dropdown-option"
                        data-selected={isSelected ? "true" : "false"}
                        onClick={() => toggleOption(option.value)}
                      >
                        <span
                          className="ommm-dropdown-checkbox"
                          data-checked={isSelected ? "true" : "false"}
                          aria-hidden
                        >
                          {isSelected ? <DropdownCheckGlyph className="h-3 w-3" /> : null}
                        </span>
                        <span className={optionLabelClassName(wrapLabel)}>{option.label}</span>
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
