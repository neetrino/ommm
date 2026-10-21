"use client";

import { useEffect, useState, type RefObject } from "react";

export type FloatingMenuAlign = "start" | "end";

export type FloatingMenuPlacement = "auto" | "top" | "bottom";

export type FloatingMenuPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: "top" | "bottom";
};

const MENU_SPACING = 8;
const DEFAULT_MIN_MENU_HEIGHT = 140;

const MENU_VIEWPORT_PADDING = 8;

function readFixedSiteHeaderInset(): number {
  const header = document.querySelector("header");
  if (header === null) {
    return MENU_VIEWPORT_PADDING;
  }
  if (window.getComputedStyle(header).position !== "fixed") {
    return MENU_VIEWPORT_PADDING;
  }
  return Math.max(MENU_VIEWPORT_PADDING, header.getBoundingClientRect().bottom + MENU_SPACING);
}

/** Prefer the side with room. `top` and `bottom` stay put unless that side cannot fit the menu. */
export function shouldOpenMenuAbove(input: {
  preferPlacement: FloatingMenuPlacement;
  availableAbove: number;
  availableBelow: number;
  minMenuHeight: number;
}): boolean {
  const aboveFits = input.availableAbove >= input.minMenuHeight;
  const belowFits = input.availableBelow >= input.minMenuHeight;
  if (input.preferPlacement === "top") {
    return aboveFits || input.availableAbove >= input.availableBelow;
  }
  if (input.preferPlacement === "bottom") {
    return !belowFits && aboveFits;
  }
  return !belowFits && input.availableAbove > input.availableBelow;
}

function clampMenuLeft(preferredLeft: number, width: number): number {
  const minLeft = MENU_VIEWPORT_PADDING;
  const maxLeft = Math.max(minLeft, window.innerWidth - width - MENU_VIEWPORT_PADDING);
  return Math.min(Math.max(minLeft, preferredLeft), maxLeft);
}

function isSameFloatingMenuPosition(
  prev: FloatingMenuPosition | null,
  next: FloatingMenuPosition,
): boolean {
  return (
    prev !== null &&
    prev.top === next.top &&
    prev.left === next.left &&
    prev.width === next.width &&
    prev.maxHeight === next.maxHeight &&
    prev.placement === next.placement
  );
}

export function useFloatingMenuPosition(
  triggerRef: RefObject<HTMLButtonElement | null>,
  open: boolean,
  disabled: boolean,
  minMenuHeight = DEFAULT_MIN_MENU_HEIGHT,
  minWidth = 0,
  menuAlign: FloatingMenuAlign = "start",
  menuSpacing = MENU_SPACING,
  freezePosition = false,
  respectHeaderInset = false,
  preferPlacement: FloatingMenuPlacement = "auto",
): FloatingMenuPosition | null {
  const [menuPosition, setMenuPosition] = useState<FloatingMenuPosition | null>(null);

  useEffect(() => {
    if (!open || disabled) {
      return undefined;
    }
    const updatePosition = () => {
      if (freezePosition) {
        return;
      }
      const trigger = triggerRef.current;
      if (trigger === null) {
        return;
      }
      const rect = trigger.getBoundingClientRect();
      const headerInset = respectHeaderInset ? readFixedSiteHeaderInset() : MENU_VIEWPORT_PADDING;
      const width = Math.min(
        Math.max(rect.width, minWidth),
        window.innerWidth - MENU_VIEWPORT_PADDING * 2,
      );
      const availableBelow = window.innerHeight - rect.bottom - menuSpacing;
      const availableAbove = rect.top - menuSpacing - headerInset;
      const openAbove = shouldOpenMenuAbove({
        preferPlacement,
        availableAbove,
        availableBelow,
        minMenuHeight,
      });
      const preferredLeft =
        menuAlign === "end" ? rect.right - width : rect.left;
      const menuTop = openAbove ? rect.top - menuSpacing : rect.bottom + menuSpacing;
      const maxHeight = openAbove
        ? Math.max(120, menuTop - headerInset)
        : Math.max(120, window.innerHeight - menuTop - MENU_VIEWPORT_PADDING);
      const next: FloatingMenuPosition = {
        top: menuTop,
        left: clampMenuLeft(preferredLeft, width),
        width,
        maxHeight,
        placement: openAbove ? "top" : "bottom",
      };
      setMenuPosition((prev) => (isSameFloatingMenuPosition(prev, next) ? prev : next));
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [
    disabled,
    freezePosition,
    menuAlign,
    menuSpacing,
    minMenuHeight,
    minWidth,
    open,
    preferPlacement,
    respectHeaderInset,
    triggerRef,
  ]);

  return menuPosition;
}
