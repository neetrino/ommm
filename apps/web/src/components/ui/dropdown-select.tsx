"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDownIcon } from "@/components/marketing/schedule/schedule-view-icons";
import { DropdownCheckGlyph } from "@/components/ui/dropdown-check-glyph";
import { useFloatingMenuPosition, type FloatingMenuAlign } from "@/components/ui/use-floating-menu-position";
import { DropdownSelectSearchHeader } from "@/components/ui/dropdown-select-search-header";
import { filterDropdownOptions } from "@/components/ui/filter-dropdown-options";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import {
  getOmmmOverlayPortalRoot,
  OMMM_FLOATING_MENU_Z_INDEX,
} from "@/lib/ommm-overlay-portal";
import { CANVAS_TABLET_MIN_WIDTH_PX } from "@/lib/viewport-breakpoints";

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
/** Mobile dismiss — keep in sync with `.ommm-dropdown-menu--mobile-dismiss` transform duration in CSS. */
const MOBILE_MENU_DISMISS_ANIMATION_MS = 560;
const HOVER_OPEN_MEDIA_QUERY = "(hover: hover) and (pointer: fine)";
const MOBILE_VIEWPORT_MEDIA_QUERY = `(max-width: ${CANVAS_TABLET_MIN_WIDTH_PX - 1}px)`;
const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";

function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION_MEDIA_QUERY).matches;
}

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
  const pendingFocusRef = useRef(false);
  const scrollDismissRef = useRef(false);
  const [menuExitHold, setMenuExitHold] = useState(false);
  const [menuAnimatedIn, setMenuAnimatedIn] = useState(false);
  const [hoverOpenCapable, setHoverOpenCapable] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const listboxId = useId();
  const menuAnimationActive = openOnHover && hoverOpenCapable;
  const menuMotionActive = menuAnimationActive || isMobileViewport;

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
    undefined,
    isMobileViewport && menuExitHold && !isMenuOpen,
    isMobileViewport,
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
    const hoverMediaQuery = window.matchMedia(HOVER_OPEN_MEDIA_QUERY);
    const mobileMediaQuery = window.matchMedia(MOBILE_VIEWPORT_MEDIA_QUERY);
    const syncPointerCapability = () => {
      setHoverOpenCapable(hoverMediaQuery.matches);
    };
    const syncMobileViewport = () => {
      setIsMobileViewport(mobileMediaQuery.matches);
    };

    syncPointerCapability();
    syncMobileViewport();
    hoverMediaQuery.addEventListener("change", syncPointerCapability);
    mobileMediaQuery.addEventListener("change", syncMobileViewport);

    return () => {
      hoverMediaQuery.removeEventListener("change", syncPointerCapability);
      mobileMediaQuery.removeEventListener("change", syncMobileViewport);
    };
  }, []);

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
        dismissMenu();
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
    if (!isMobileViewport || (!isMenuOpen && !menuExitHold)) {
      return undefined;
    }

    document.body.dataset.ommmDropdownOpen = "true";
    return () => {
      delete document.body.dataset.ommmDropdownOpen;
    };
  }, [isMenuOpen, isMobileViewport, menuExitHold]);

  useEffect(() => {
    if (!open || disabled || !isMobileViewport) {
      return undefined;
    }

    const closeOnPageScroll = (event: Event) => {
      if (scrollDismissRef.current) {
        return;
      }
      if (event.target instanceof Node && menuRef.current?.contains(event.target)) {
        return;
      }
      scrollDismissRef.current = true;
      dismissMenu();
    };

    window.addEventListener("scroll", closeOnPageScroll, true);
    return () => {
      window.removeEventListener("scroll", closeOnPageScroll, true);
    };
  }, [disabled, isMobileViewport, open]);

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
    if (!menuMotionActive) {
      return undefined;
    }

    if (!isMenuOpen) {
      const exitId = window.requestAnimationFrame(() => {
        setMenuAnimatedIn(false);
      });
      return () => window.cancelAnimationFrame(exitId);
    }

    if (prefersReducedMotion()) {
      const enterId = window.requestAnimationFrame(() => {
        setMenuAnimatedIn(true);
      });
      return () => window.cancelAnimationFrame(enterId);
    }

    const enterId = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setMenuAnimatedIn(true));
    });
    return () => window.cancelAnimationFrame(enterId);
  }, [isMenuOpen, menuMotionActive]);

  function dismissMenu(options?: { focusTrigger?: boolean }) {
    const focusTrigger = options?.focusTrigger ?? false;
    clearHoverCloseTimer();
    setSearchQuery("");

    const animatedExit = menuMotionActive && open && !prefersReducedMotion();
    if (animatedExit) {
      setMenuExitHold(true);
      setOpen(false);
      if (focusTrigger) {
        pendingFocusRef.current = true;
      }
      return;
    }

    scrollDismissRef.current = false;
    setOpen(false);
    setMenuExitHold(false);
    setMenuAnimatedIn(false);
    if (focusTrigger) {
      window.requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }
  }

  function closeAndFocusTrigger() {
    dismissMenu({ focusTrigger: true });
  }

  function selectValue(next: T) {
    onChange(next);
    closeAndFocusTrigger();
  }

  function openMenu(initialIndex: number) {
    if (disabled || options.length === 0) {
      return;
    }
    if (menuMotionActive) {
      setMenuExitHold(true);
    }
    setSearchQuery("");
    setFocusedIndex(initialIndex);
    setOpen(true);
  }

  function handleMenuTransitionEnd(event: React.TransitionEvent<HTMLDivElement>) {
    if (!menuMotionActive || event.target !== event.currentTarget) {
      return;
    }
    const exitProperty = isMobileViewport ? "transform" : "opacity";
    if (event.propertyName !== exitProperty) {
      return;
    }
    if (!isMenuOpen && !menuAnimatedIn) {
      setMenuExitHold(false);
      scrollDismissRef.current = false;
      if (pendingFocusRef.current) {
        pendingFocusRef.current = false;
        triggerRef.current?.focus();
      }
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
    return hoverOpenCapable;
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
      dismissMenu();
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

      {(menuMotionActive ? menuExitHold : isMenuOpen) &&
      menuPosition !== null &&
      portalReady
        ? createPortal(
            <div
              ref={menuRef}
              className={mergeClasses(
                "ommm-dropdown-menu",
                menuMotionActive ? "ommm-dropdown-menu--hover-animated" : undefined,
                isMobileViewport ? "ommm-dropdown-menu--mobile-dismiss" : undefined,
                menuMotionActive && menuAnimatedIn
                  ? "ommm-dropdown-menu--visible"
                  : undefined,
                menuClassName,
              )}
              data-placement={menuPosition.placement}
              onMouseEnter={openOnHover ? handleHoverZoneEnter : undefined}
              onMouseLeave={openOnHover ? handleHoverZoneLeave : undefined}
              onTransitionEnd={menuMotionActive ? handleMenuTransitionEnd : undefined}
              style={{
                position: "fixed",
                zIndex: isMobileViewport ? OMMM_FLOATING_MENU_Z_INDEX : undefined,
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
                maxHeight: disableMenuScroll ? undefined : menuPosition.maxHeight,
                transform: menuMotionActive
                  ? undefined
                  : menuPosition.placement === "top"
                    ? "translate3d(0, -100%, 0)"
                    : "translate3d(0, 0, 0)",
                transitionDuration:
                  menuMotionActive && !isMobileViewport
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
            isMobileViewport ? getOmmmOverlayPortalRoot() : document.body,
          )
        : null}

      {name ? <input type="hidden" name={name} value={value} required={required} /> : null}
    </div>
  );
}
