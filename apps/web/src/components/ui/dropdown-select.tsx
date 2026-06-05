"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDownIcon } from "@/components/marketing/schedule/schedule-view-icons";
import { DropdownCheckGlyph } from "@/components/ui/dropdown-check-glyph";
import { useFloatingMenuPosition, type FloatingMenuAlign } from "@/components/ui/use-floating-menu-position";
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
  showChevron?: boolean;
  /** Minimum floating menu width in px when wider than the trigger. */
  menuMinWidth?: number;
  /** Horizontal alignment of the menu relative to the trigger. */
  menuAlign?: FloatingMenuAlign;
  /** Open on pointer hover (fine pointers only); keeps menu open while cursor is over trigger or menu. */
  openOnHover?: boolean;
};

const HOVER_MENU_CLOSE_DELAY_MS = 180;
const HOVER_MENU_ANIMATION_MS = 220;

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
  showChevron = true,
  menuMinWidth,
  menuAlign,
  openOnHover = false,
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
  const hoverCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [menuExitHold, setMenuExitHold] = useState(false);
  const [menuAnimatedIn, setMenuAnimatedIn] = useState(false);
  const listboxId = useId();
  const menuAnimationActive = openOnHover;

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
  const menuPosition = useFloatingMenuPosition(
    triggerRef,
    isMenuOpen || menuExitHold,
    disabled,
    undefined,
    menuMinWidth ?? 0,
    menuAlign ?? "start",
  );
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
    const closeOnOutside = (event: MouseEvent) => {
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
    const listenerId = window.setTimeout(() => {
      document.addEventListener("click", closeOnOutside);
    }, 0);
    return () => {
      window.clearTimeout(listenerId);
      document.removeEventListener("click", closeOnOutside);
    };
  }, [disabled, open]);

  useEffect(() => {
    if (!isMenuOpen || openOnHover) {
      return;
    }
    optionRefs.current[safeFocusedIndex]?.focus();
  }, [isMenuOpen, openOnHover, safeFocusedIndex]);

  useEffect(() => {
    return () => {
      if (hoverCloseTimerRef.current !== null) {
        clearTimeout(hoverCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!menuAnimationActive) {
      return;
    }
    if (isMenuOpen) {
      setMenuExitHold(true);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setMenuAnimatedIn(true);
        return;
      }
      const enterId = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setMenuAnimatedIn(true));
      });
      return () => window.cancelAnimationFrame(enterId);
    }
    setMenuAnimatedIn(false);
  }, [isMenuOpen, menuAnimationActive]);

  function closeAndFocusTrigger() {
    clearHoverCloseTimer();
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
    if (menuAnimationActive) {
      setMenuExitHold(true);
    }
    setSearchQuery("");
    setFocusedIndex(initialIndex);
    setOpen(true);
  }

  function handleMenuTransitionEnd(event: React.TransitionEvent<HTMLDivElement>) {
    if (!menuAnimationActive || event.target !== event.currentTarget) {
      return;
    }
    if (event.propertyName !== "opacity") {
      return;
    }
    if (!isMenuOpen && !menuAnimatedIn) {
      setMenuExitHold(false);
    }
  }

  function clearHoverCloseTimer() {
    if (hoverCloseTimerRef.current !== null) {
      clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
  }

  function canOpenOnHover(): boolean {
    if (!openOnHover || disabled || options.length === 0) {
      return false;
    }
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }

  function handleHoverZoneEnter() {
    if (!canOpenOnHover()) {
      return;
    }
    clearHoverCloseTimer();
    if (!open) {
      openMenu(selectedIndex);
    }
  }

  function handleHoverZoneLeave() {
    if (!openOnHover) {
      return;
    }
    clearHoverCloseTimer();
    hoverCloseTimerRef.current = setTimeout(() => {
      setSearchQuery("");
      setOpen(false);
    }, HOVER_MENU_CLOSE_DELAY_MS);
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
    <div
      ref={rootRef}
      className={mergeClasses("ommm-dropdown-root", className)}
      onMouseEnter={openOnHover ? handleHoverZoneEnter : undefined}
      onMouseLeave={openOnHover ? handleHoverZoneLeave : undefined}
    >
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
            data-dropdown-chevron=""
            className={mergeClasses(
              "ml-auto inline-flex shrink-0 origin-center text-sage-500 transition-transform duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
              isMenuOpen ? "rotate-180" : "rotate-0",
              wrapLabel ? "self-center" : undefined,
            )}
          >
            <ChevronDownIcon />
          </span>
        ) : null}
      </button>

      {(menuAnimationActive ? menuExitHold : isMenuOpen) &&
      menuPosition !== null &&
      portalReady
        ? createPortal(
            <div
              ref={menuRef}
              className={mergeClasses(
                "ommm-dropdown-menu",
                menuAnimationActive ? "ommm-dropdown-menu--hover-animated" : undefined,
                menuAnimationActive && menuAnimatedIn
                  ? "ommm-dropdown-menu--visible"
                  : undefined,
                menuClassName,
              )}
              data-placement={menuPosition.placement}
              onMouseEnter={openOnHover ? handleHoverZoneEnter : undefined}
              onMouseLeave={openOnHover ? handleHoverZoneLeave : undefined}
              onTransitionEnd={menuAnimationActive ? handleMenuTransitionEnd : undefined}
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
                maxHeight: disableMenuScroll ? undefined : menuPosition.maxHeight,
                transform: menuAnimationActive
                  ? undefined
                  : menuPosition.placement === "top"
                    ? "translateY(-100%)"
                    : undefined,
                transitionDuration: menuAnimationActive
                  ? `${HOVER_MENU_ANIMATION_MS}ms`
                  : undefined,
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
