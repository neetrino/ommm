"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { restoreLocaleSwitchScroll } from "@/lib/locale-switch-scroll";

/** Keeps scroll position after in-app locale switches (no jump to top). */
export function LocaleScrollRestore(): null {
  const locale = useLocale();
  const pathname = usePathname();

  useEffect(() => {
    restoreLocaleSwitchScroll();
  }, [locale, pathname]);

  return null;
}
