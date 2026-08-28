"use client";

import { useEffect, useRef } from "react";

export const OMMM_ADMIN_HEADER_STICKY_OFFSET_VAR = "--ommm-admin-header-sticky-offset";

/**
 * Whether the page banner should use sticky shell classes.
 * Phone non-stickiness is enforced in CSS (`max-width: 743px`) so server/client
 * markup stays identical — do not gate on `matchMedia` (hydration mismatch on phone).
 * Behavior matches the previous phone gate: banners do not stick under the glass navbar.
 */
export function useAdminPageHeaderSticky(preferred: boolean): boolean {
  return preferred;
}

/**
 * Tracks the admin dashboard sticky header height for nested sticky regions (e.g. packages toolbar).
 */
export function useAdminStickyHeaderOffset(enabled: boolean) {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const el = headerRef.current;
    if (el === null) {
      return undefined;
    }

    const sync = () => {
      document.documentElement.style.setProperty(
        OMMM_ADMIN_HEADER_STICKY_OFFSET_VAR,
        `${el.getBoundingClientRect().height}px`,
      );
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    window.addEventListener("resize", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
      document.documentElement.style.removeProperty(OMMM_ADMIN_HEADER_STICKY_OFFSET_VAR);
    };
  }, [enabled]);

  return headerRef;
}
