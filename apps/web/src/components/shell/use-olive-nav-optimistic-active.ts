"use client";

import { useEffect, useState } from "react";
import { dashboardNavPathActive } from "@/lib/dashboard-nav";

/**
 * Optimistic sidebar active row — slides the olive pill on click before the
 * soft route transition updates `pathname` (same feel as admin).
 */
export function useOliveNavOptimisticActive(pathname: string) {
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const activePathname = pendingHref ?? pathname;

  function onNavItemClick(itemHref: string, onNavigate: () => void): void {
    onNavigate();

    if (pendingHref === itemHref || dashboardNavPathActive(pathname, itemHref)) {
      return;
    }

    setPendingHref(itemHref);
  }

  return { activePathname, onNavItemClick };
}
