"use client";

import { useEffect, useState, type RefObject } from "react";

export type FloatingMenuAlign = "start" | "end";

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

function clampMenuLeft(preferredLeft: number, width: number): number {
  const minLeft = MENU_VIEWPORT_PADDING;
  const maxLeft = Math.max(minLeft, window.innerWidth - width - MENU_VIEWPORT_PADDING);
  return Math.min(Math.max(minLeft, preferredLeft), maxLeft);
}

export function useFloatingMenuPosition(
  triggerRef: RefObject<HTMLButtonElement | null>,
  open: boolean,
  disabled: boolean,
  minMenuHeight = DEFAULT_MIN_MENU_HEIGHT,
  minWidth = 0,
  menuAlign: FloatingMenuAlign = "start",
  menuSpacing = MENU_SPACING,
): FloatingMenuPosition | null {
  const [menuPosition, setMenuPosition] = useState<FloatingMenuPosition | null>(null);

  useEffect(() => {
    if (!open || disabled) {
      return undefined;
    }
    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (trigger === null) {
        return;
      }
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(
        Math.max(rect.width, minWidth),
        window.innerWidth - MENU_VIEWPORT_PADDING * 2,
      );
      const availableBelow = window.innerHeight - rect.bottom - menuSpacing;
      const availableAbove = rect.top - menuSpacing;
      const openAbove = availableBelow < minMenuHeight && availableAbove > availableBelow;
      const preferredLeft =
        menuAlign === "end" ? rect.right - width : rect.left;
      setMenuPosition({
        top: openAbove ? rect.top - menuSpacing : rect.bottom + menuSpacing,
        left: clampMenuLeft(preferredLeft, width),
        width,
        maxHeight: Math.max(120, openAbove ? availableAbove : availableBelow),
        placement: openAbove ? "top" : "bottom",
      });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [disabled, menuAlign, menuSpacing, minMenuHeight, minWidth, open, triggerRef]);

  return menuPosition;
}
