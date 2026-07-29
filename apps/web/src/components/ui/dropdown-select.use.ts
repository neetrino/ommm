"use client";

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { prefersReducedMotion } from "@/components/ui/dropdown-select.helpers";
import type { DropdownSelectProps } from "@/components/ui/dropdown-select.types";
import { useDropdownSelectEffects } from "@/components/ui/dropdown-select.use-effects";
import { useDropdownSelectHandlers } from "@/components/ui/dropdown-select.use-handlers";
import { useFloatingMenuPosition } from "@/components/ui/use-floating-menu-position";
import { filterDropdownOptions } from "@/components/ui/filter-dropdown-options";

type UseDropdownSelectParams<T extends string> = Pick<
  DropdownSelectProps<T>,
  | "value"
  | "options"
  | "onChange"
  | "disabled"
  | "searchable"
  | "disableMenuScroll"
  | "menuMinWidth"
  | "menuAlign"
  | "openOnHover"
  | "animateMenuDismiss"
  | "toggleDeselectValue"
> & {
  onChange: (value: T) => void;
};

export function useDropdownSelect<T extends string>({
  value,
  options,
  onChange,
  disabled = false,
  searchable = false,
  disableMenuScroll = false,
  menuMinWidth,
  menuAlign,
  openOnHover = false,
  animateMenuDismiss = false,
  toggleDeselectValue,
}: UseDropdownSelectParams<T>) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
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
  const menuDismissMotion = isMobileViewport || animateMenuDismiss;
  const menuMotionActive = menuAnimationActive || menuDismissMotion;

  const clearHoverCloseTimer = useCallback(() => {
    if (hoverCloseTimerRef.current !== null) {
      clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
  }, []);

  const dismissMenu = useCallback(
    (dismissOptions?: { focusTrigger?: boolean }) => {
      const focusTrigger = dismissOptions?.focusTrigger ?? false;
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
    },
    [clearHoverCloseTimer, menuMotionActive, open],
  );

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
    menuDismissMotion && menuExitHold && !isMenuOpen,
    menuDismissMotion,
  );
  const searchHeaderHeight = searchable ? 56 : 0;
  const listMaxHeight =
    menuPosition === null || disableMenuScroll
      ? undefined
      : Math.max(96, menuPosition.maxHeight - 16 - searchHeaderHeight);

  useDropdownSelectEffects({
    open,
    disabled,
    searchable,
    openOnHover,
    isMenuOpen,
    isMobileViewport,
    menuExitHold,
    menuMotionActive,
    safeFocusedIndex,
    rootRef,
    triggerRef,
    menuRef,
    searchInputRef,
    optionRefs,
    hoverCloseTimerRef,
    scrollDismissRef,
    setHoverOpenCapable,
    setIsMobileViewport,
    setMenuAnimatedIn,
    dismissMenu,
  });

  const handlers = useDropdownSelectHandlers({
    disabled,
    searchable,
    openOnHover,
    open,
    optionsLength: options.length,
    hoverOpenCapable,
    menuMotionActive,
    menuDismissMotion,
    isMenuOpen,
    menuAnimatedIn,
    selectedIndex,
    visibleOptions,
    triggerRef,
    searchInputRef,
    optionRefs,
    hoverCloseTimerRef,
    pendingFocusRef,
    scrollDismissRef,
    setSearchQuery,
    setFocusedIndex,
    setMenuExitHold,
    setOpen,
    clearHoverCloseTimer,
    dismissMenu,
    onChange,
    value,
    toggleDeselectValue,
  });

  return {
    rootRef,
    triggerRef,
    menuRef,
    searchInputRef,
    optionRefs,
    listboxId,
    selected,
    selectedIndex,
    isMenuOpen,
    menuExitHold,
    menuMotionActive,
    menuDismissMotion,
    menuAnimatedIn,
    menuPosition,
    listMaxHeight,
    visibleOptions,
    safeFocusedIndex,
    searchQuery,
    setSearchQuery,
    dismissMenu,
    ...handlers,
  };
}
