"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDownIcon } from "@/components/marketing/schedule/schedule-view-icons";
import { DropdownCheckGlyph } from "@/components/ui/dropdown-check-glyph";
import { useFloatingMenuPosition, type FloatingMenuAlign } from "@/components/ui/use-floating-menu-position";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";

export type DropdownOption<T extends string> = {
  value: T;
  label: string;
};

export type DropdownSelectProps<T extends string> = {
  label: string;
  ariaLabel: string;
  value: T;
  options: readonly DropdownOption<T>[];
  onChange: (value: T) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  /** When true, label text wraps instead of truncating with ellipsis. */
  wrapLabel?: boolean;
  renderValue?: (option: DropdownOption<T> | undefined) => ReactNode;
  renderOption?: (option: DropdownOption<T>, selected: boolean) => ReactNode;
  showChevron?: boolean;
  /** Minimum floating menu width in px when wider than the trigger. */
  menuMinWidth?: number;
  /** Horizontal alignment of the menu relative to the trigger. */
  menuAlign?: FloatingMenuAlign;
};

function mergeClasses(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

function isCharacterNavigationKey(event: React.KeyboardEvent<HTMLButtonElement>): boolean {
  return event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ";
}

function optionLabelClassName(wrapLabel: boolean): string {
  return wrapLabel
    ? "min-w-0 flex-1 whitespace-normal break-words leading-snug"
    : "min-w-0 flex-1 truncate";
}

function DefaultOptionContent<T extends string>({
  option,
  selected,
  wrapLabel = false,
}: {
  option: DropdownOption<T>;
  selected: boolean;
  wrapLabel?: boolean;
}) {
  return (
    <>
      <span
        className="ommm-dropdown-checkbox"
        data-checked={selected ? "true" : "false"}
        aria-hidden
      >
        {selected ? <DropdownCheckGlyph className="h-3 w-3" /> : null}
      </span>
      <span className={optionLabelClassName(wrapLabel)}>{option.label}</span>
    </>
  );
}

export function DropdownSelect<T extends string>({
  label,
  ariaLabel,
  value,
  options,
  onChange,
  name,
  disabled = false,
  required = false,
  className,
  triggerClassName,
  menuClassName,
  wrapLabel = false,
  renderValue,
  renderOption,
  showChevron = true,
  menuMinWidth,
  menuAlign,
}: DropdownSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const portalReady = useIsClientMounted();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listboxId = useId();

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );
  const selectedIndex = useMemo(
    () => Math.max(0, options.findIndex((option) => option.value === value)),
    [options, value],
  );
  const isMenuOpen = open && !disabled && options.length > 0;
  const menuPosition = useFloatingMenuPosition(
    triggerRef,
    isMenuOpen,
    disabled,
    undefined,
    menuMinWidth ?? 0,
    menuAlign ?? "start",
  );

  useEffect(() => {
    if (!open || disabled) {
      return undefined;
    }
    const closeOnOutside = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) {
        return;
      }
      const clickedTrigger = rootRef.current?.contains(event.target) ?? false;
      const clickedMenu = menuRef.current?.contains(event.target) ?? false;
      if (!clickedTrigger && !clickedMenu) {
        setOpen(false);
      }
    };
    const listenerId = window.setTimeout(() => {
      document.addEventListener("click", closeOnOutside);
    }, 0);
    return () => {
      window.clearTimeout(listenerId);
      document.removeEventListener("click", closeOnOutside);
    };
  }, [disabled, open]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }
    optionRefs.current[focusedIndex]?.focus();
  }, [focusedIndex, isMenuOpen]);

  function closeAndFocusTrigger() {
    setOpen(false);
    window.requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }

  function selectValue(next: T) {
    onChange(next);
    closeAndFocusTrigger();
  }

  function openMenu(initialIndex: number) {
    if (disabled || options.length === 0) {
      return;
    }
    setFocusedIndex(initialIndex);
    setOpen(true);
  }

  function onTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (!isCharacterNavigationKey(event)) {
      return;
    }
    event.preventDefault();
    const startIndex = event.key === "ArrowUp" ? options.length - 1 : selectedIndex;
    openMenu(startIndex);
  }

  function onOptionKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
    option: DropdownOption<T>,
  ) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeAndFocusTrigger();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedIndex((index + 1) % options.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setFocusedIndex((index - 1 + options.length) % options.length);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setFocusedIndex(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setFocusedIndex(options.length - 1);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectValue(option.value);
    }
  }

  const triggerContent = renderValue ? (
    renderValue(selected)
  ) : (
    <span
      className={mergeClasses(
        optionLabelClassName(wrapLabel),
        "text-sm font-semibold text-[#464646]",
      )}
    >
      {selected?.label ?? label}
    </span>
  );

  return (
    <div ref={rootRef} className={mergeClasses("ommm-dropdown-root", className)}>
      <p className="sr-only">{ariaLabel}</p>
      <button
        ref={triggerRef}
        type="button"
        className={mergeClasses(
          "ommm-dropdown-trigger",
          wrapLabel ? "h-auto min-h-11 items-start py-2.5" : undefined,
          triggerClassName,
        )}
        data-open={isMenuOpen ? "true" : "false"}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isMenuOpen}
        aria-controls={listboxId}
        disabled={disabled || options.length === 0}
        onClick={() => (isMenuOpen ? closeAndFocusTrigger() : openMenu(selectedIndex))}
        onKeyDown={onTriggerKeyDown}
      >
        {triggerContent}
        {showChevron ? (
          <span
            className={mergeClasses(
              "ml-auto shrink-0 text-sage-500",
              wrapLabel ? "self-center" : undefined,
            )}
          >
            <ChevronDownIcon />
          </span>
        ) : null}
      </button>

      {isMenuOpen && menuPosition !== null && portalReady && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              className={mergeClasses("ommm-dropdown-menu", menuClassName)}
              style={{
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
                className="ommm-dropdown-menu-list"
                style={{ maxHeight: Math.max(96, menuPosition.maxHeight - 16) }}
              >
                {options.map((option, index) => {
                  const isSelected = option.value === value;
                  return (
                    <li key={option.value} role="presentation">
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
                          renderOption ? "ommm-dropdown-option-custom" : undefined,
                        )}
                        data-selected={isSelected ? "true" : "false"}
                        onClick={() => selectValue(option.value)}
                        onKeyDown={(event) => onOptionKeyDown(event, index, option)}
                      >
                        {renderOption ? (
                          renderOption(option, isSelected)
                        ) : (
                          <DefaultOptionContent
                            option={option}
                            selected={isSelected}
                            wrapLabel={wrapLabel}
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>,
            document.body,
          )
        : null}

      {name ? <input type="hidden" name={name} value={value} required={required} /> : null}
    </div>
  );
}
