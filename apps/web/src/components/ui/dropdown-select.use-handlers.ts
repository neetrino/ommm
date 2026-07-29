"use client";

import {
  useCallback,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import { HOVER_MENU_CLOSE_DELAY_MS } from "@/components/ui/dropdown-select.constants";
import { isCharacterNavigationKey } from "@/components/ui/dropdown-select.helpers";
import type { DropdownOption } from "@/components/ui/dropdown-select.types";

type UseDropdownSelectHandlersParams<T extends string> = {
  disabled: boolean;
  searchable: boolean;
  openOnHover: boolean;
  open: boolean;
  optionsLength: number;
  hoverOpenCapable: boolean;
  menuMotionActive: boolean;
  menuDismissMotion: boolean;
  isMenuOpen: boolean;
  menuAnimatedIn: boolean;
  selectedIndex: number;
  visibleOptions: DropdownOption<T>[];
  triggerRef: MutableRefObject<HTMLButtonElement | null>;
  searchInputRef: MutableRefObject<HTMLInputElement | null>;
  optionRefs: MutableRefObject<Array<HTMLButtonElement | null>>;
  hoverCloseTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  pendingFocusRef: MutableRefObject<boolean>;
  scrollDismissRef: MutableRefObject<boolean>;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  setFocusedIndex: Dispatch<SetStateAction<number>>;
  setMenuExitHold: Dispatch<SetStateAction<boolean>>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  clearHoverCloseTimer: () => void;
  dismissMenu: (options?: { focusTrigger?: boolean }) => void;
  onChange: (value: T) => void;
  value: T;
  toggleDeselectValue?: T;
};

export function useDropdownSelectHandlers<T extends string>({
  disabled,
  searchable,
  openOnHover,
  open,
  optionsLength,
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
}: UseDropdownSelectHandlersParams<T>) {
  const closeAndFocusTrigger = useCallback(() => {
    dismissMenu({ focusTrigger: true });
  }, [dismissMenu]);

  const selectValue = useCallback(
    (next: T) => {
      if (
        toggleDeselectValue !== undefined &&
        next === value &&
        value !== toggleDeselectValue
      ) {
        onChange(toggleDeselectValue);
      } else {
        onChange(next);
      }
      dismissMenu({ focusTrigger: true });
    },
    [dismissMenu, onChange, toggleDeselectValue, value],
  );

  const openMenu = useCallback(
    (initialIndex: number) => {
      if (disabled || optionsLength === 0) {
        return;
      }
      if (menuMotionActive) {
        setMenuExitHold(true);
      }
      setSearchQuery("");
      setFocusedIndex(initialIndex);
      setOpen(true);
    },
    [disabled, menuMotionActive, optionsLength, setFocusedIndex, setMenuExitHold, setOpen, setSearchQuery],
  );

  const handleMenuTransitionEnd = useCallback(
    (event: React.TransitionEvent<HTMLDivElement>) => {
      if (!menuMotionActive || event.target !== event.currentTarget) {
        return;
      }
      const exitProperty = menuDismissMotion ? "transform" : "opacity";
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
    },
    [
      isMenuOpen,
      menuAnimatedIn,
      menuDismissMotion,
      menuMotionActive,
      pendingFocusRef,
      scrollDismissRef,
      setMenuExitHold,
      triggerRef,
    ],
  );

  const canOpenOnHover = useCallback((): boolean => {
    if (!openOnHover || disabled || optionsLength === 0) {
      return false;
    }
    return hoverOpenCapable;
  }, [disabled, hoverOpenCapable, openOnHover, optionsLength]);

  const handleHoverZoneEnter = useCallback(() => {
    if (!canOpenOnHover()) {
      return;
    }
    clearHoverCloseTimer();
    if (!open) {
      openMenu(selectedIndex);
    }
  }, [canOpenOnHover, clearHoverCloseTimer, open, openMenu, selectedIndex]);

  const handleHoverZoneLeave = useCallback(() => {
    if (!openOnHover) {
      return;
    }
    clearHoverCloseTimer();
    hoverCloseTimerRef.current = setTimeout(() => {
      dismissMenu();
    }, HOVER_MENU_CLOSE_DELAY_MS);
  }, [clearHoverCloseTimer, dismissMenu, hoverCloseTimerRef, openOnHover]);

  const onSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
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
    },
    [closeAndFocusTrigger, optionRefs, selectValue, setFocusedIndex, visibleOptions],
  );

  const onOptionKeyDown = useCallback(
    (
      event: React.KeyboardEvent<HTMLButtonElement>,
      index: number,
      option: DropdownOption<T>,
    ) => {
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
    },
    [
      closeAndFocusTrigger,
      searchInputRef,
      searchable,
      selectValue,
      setFocusedIndex,
      visibleOptions.length,
    ],
  );

  const onTriggerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (!isCharacterNavigationKey(event)) {
        return;
      }
      event.preventDefault();
      const startIndex = event.key === "ArrowUp" ? visibleOptions.length - 1 : selectedIndex;
      openMenu(startIndex);
    },
    [openMenu, selectedIndex, visibleOptions.length],
  );

  return {
    closeAndFocusTrigger,
    selectValue,
    openMenu,
    handleMenuTransitionEnd,
    handleHoverZoneEnter,
    handleHoverZoneLeave,
    onSearchKeyDown,
    onOptionKeyDown,
    onTriggerKeyDown,
  };
}
