"use client";

import { useEffect, useState, type RefObject } from "react";

export type FloatingMenuPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: "top" | "bottom";
};

const MENU_SPACING = 8;
const DEFAULT_MIN_MENU_HEIGHT = 140;

export function useFloatingMenuPosition(
  triggerRef: RefObject<HTMLButtonElement | null>,
  open: boolean,
  disabled: boolean,
  minMenuHeight = DEFAULT_MIN_MENU_HEIGHT,
  minWidth = 0,
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
        window.innerWidth - 16,
      );
      const availableBelow = window.innerHeight - rect.bottom - MENU_SPACING;
      const availableAbove = rect.top - MENU_SPACING;
      const openAbove = availableBelow < minMenuHeight && availableAbove > availableBelow;
      setMenuPosition({
        top: openAbove ? rect.top - MENU_SPACING : rect.bottom + MENU_SPACING,
        left: Math.min(rect.left, Math.max(8, window.innerWidth - width - 8)),
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
  }, [disabled, minMenuHeight, minWidth, open, triggerRef]);

  return menuPosition;
}
