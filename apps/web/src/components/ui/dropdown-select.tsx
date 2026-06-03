"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDownIcon } from "@/components/marketing/schedule/schedule-view-icons";
import { DropdownCheckGlyph } from "@/components/ui/dropdown-check-glyph";
import { useFloatingMenuPosition } from "@/components/ui/use-floating-menu-position";
import { DropdownSelectSearchHeader } from "@/components/ui/dropdown-select-search-header";
import { filterDropdownOptions } from "@/components/ui/filter-dropdown-options";
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
  /** Disable viewport-constrained max height for short static menus (e.g. language switcher). */
  disableMenuScroll?: boolean;
  /** Show a search field inside the menu to filter options by label. */
  searchable?: boolean;
  searchPlaceholder?: string;
  noResultsLabel?: string;
  renderValue?: (option: DropdownOption<T> | undefined) => ReactNode;
  renderOption?: (option: DropdownOption<T>, selected: boolean) => ReactNode;
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
  disableMenuScroll = false,
  searchable = false,
  searchPlaceholder = "",
  noResultsLabel = "",
  renderValue,
  renderOption,
}: DropdownSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const portalReady = useIsClientMounted();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listboxId = useId();

  const visibleOptions = useMemo(
    () => (searchable ? filterDropdownOptions(options, searchQuery) : [...options]),
    [options, searchable, searchQuery],
  );

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );
  const selectedIndex = useMemo(() => {
    const index = visibleOptions.findIndex((option) => option.value === value);
    return Math.max(0, index);
  }, [value, visibleOptions]);
  const isMenuOpen = open && !disabled && options.length > 0;
  const visibleOptionLastIndex = Math.max(0, visibleOptions.length - 1);
  const safeFocusedIndex = Math.min(focusedIndex, visibleOptionLastIndex);
  const menuPosition = useFloatingMenuPosition(triggerRef, isMenuOpen, disabled);
  const searchHeaderHeight = searchable ? 56 : 0;
  const listMaxHeight =
    menuPosition === null || disableMenuScroll
      ? undefined
      : Math.max(96, menuPosition.maxHeight - 16 - searchHeaderHeight);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }
    if (!searchable) {
      return;
    }
    const handle = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
    return () => {
      window.cancelAnimationFrame(handle);
    };
  }, [isMenuOpen, searchable]);

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
        setSearchQuery("");
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
    optionRefs.current[safeFocusedIndex]?.focus();
  }, [isMenuOpen, safeFocusedIndex]);

  function closeAndFocusTrigger() {
    setOpen(false);
    setSearchQuery("");
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
    setSearchQuery("");
    setFocusedIndex(initialIndex);
    setOpen(true);
  }

  function onSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeAndFocusTrigger();
      return;
    }
    if (event.key === "ArrowDown" && visibleOptions.length > 0) {
      event.preventDefault();
      setFocusedIndex(0);
      optionRefs.current[0]?.focus();
      return;
    }
    if (event.key === "Enter" && visibleOptions.length === 1) {
      event.preventDefault();
      selectValue(visibleOptions[0].value);
    }
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
    if (visibleOptions.length === 0) {
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusedIndex((index + 1) % visibleOptions.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (index === 0 && searchable) {
        searchInputRef.current?.focus();
        return;
      }
      setFocusedIndex((index - 1 + visibleOptions.length) % visibleOptions.length);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setFocusedIndex(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setFocusedIndex(visibleOptions.length - 1);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectValue(option.value);
    }
  }

  function onTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (!isCharacterNavigationKey(event)) {
      return;
    }
    event.preventDefault();
    const startIndex = event.key === "ArrowUp" ? visibleOptions.length - 1 : selectedIndex;
    openMenu(startIndex);
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
        <span className={mergeClasses("ml-auto shrink-0 text-sage-500", wrapLabel ? "self-center" : undefined)}>
          <ChevronDownIcon />
        </span>
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
                maxHeight: disableMenuScroll ? undefined : menuPosition.maxHeight,
                transform: menuPosition.placement === "top" ? "translateY(-100%)" : undefined,
              }}
            >
              {searchable ? (
                <DropdownSelectSearchHeader
                  value={searchQuery}
                  placeholder={searchPlaceholder}
                  inputRef={searchInputRef}
                  onChange={setSearchQuery}
                  onKeyDown={onSearchKeyDown}
                />
              ) : null}
              <ul
                id={listboxId}
                role="listbox"
                aria-label={ariaLabel}
                className={mergeClasses(
                  "ommm-dropdown-menu-list",
                  disableMenuScroll ? "ommm-dropdown-menu-list-static" : undefined,
                )}
                style={listMaxHeight === undefined ? undefined : { maxHeight: listMaxHeight }}
              >
                {visibleOptions.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-sage-500" role="presentation">
                    {noResultsLabel}
                  </li>
                ) : null}
                {visibleOptions.map((option, index) => {
                  const isSelected = option.value === value;
                  return (
                    <li key={option.value} role="presentation">
                      <button
                        ref={(node) => {
                          optionRefs.current[index] = node;
                        }}
                        type="button"
                        role="option"
                        tabIndex={index === safeFocusedIndex ? 0 : -1}
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
