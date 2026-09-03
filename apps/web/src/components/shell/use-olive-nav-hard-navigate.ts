"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { useReducedMotion } from "framer-motion";
import { OLIVE_NAV_PILL_DURATION_MS } from "@/components/shell/olive-nav-active-thumb";
import { dashboardNavPathActive } from "@/lib/dashboard-nav";

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

/**
 * Desktop member hard navigation remounts the document (to bypass intercept routes).
 * Hold pending href so the olive pill can slide first, then assign location.
 */
export function useOliveNavHardNavigate(pathname: string) {
  const reduceMotion = useReducedMotion();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const activePathname = pendingHref ?? pathname;

  const onHardNavigateClick = useCallback(
    (
      event: MouseEvent<HTMLAnchorElement>,
      itemHref: string,
      onNavigate: () => void,
    ) => {
      onNavigate();

      if (!isPlainLeftClick(event)) {
        return;
      }

      event.preventDefault();

      if (
        pendingHref === itemHref ||
        (pendingHref === null && dashboardNavPathActive(pathname, itemHref))
      ) {
        return;
      }

      const destination = event.currentTarget.href;
      setPendingHref(itemHref);

      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
      }

      const delayMs = reduceMotion ? 0 : OLIVE_NAV_PILL_DURATION_MS;
      timerRef.current = window.setTimeout(() => {
        window.location.assign(destination);
      }, delayMs);
    },
    [pathname, pendingHref, reduceMotion],
  );

  return { activePathname, onHardNavigateClick };
}
