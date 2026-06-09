"use client";

import { useLayoutEffect } from "react";
import { lockBodyScroll } from "@/lib/body-scroll-lock";

/** Locks background scroll while `active` (iOS-safe — fixes window-level member mobile scroll). */
export function useLockBodyScroll(active: boolean): void {
  useLayoutEffect(() => {
    if (!active) {
      return undefined;
    }

    return lockBodyScroll();
  }, [active]);
}
