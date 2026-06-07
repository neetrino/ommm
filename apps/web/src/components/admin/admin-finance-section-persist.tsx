"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import {
  FINANCE_SECTION_COOKIE_NAME,
  resolveFinanceSectionFromPathname,
} from "@/components/admin/admin-finance-module";

const FINANCE_SECTION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/** Remembers the last visited finance tab for `/admin/finance` redirects. */
export function AdminFinanceSectionPersist() {
  const pathname = usePathname();
  const section = resolveFinanceSectionFromPathname(pathname);

  useEffect(() => {
    if (!section) {
      return;
    }
    document.cookie = `${FINANCE_SECTION_COOKIE_NAME}=${section}; path=/; max-age=${FINANCE_SECTION_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  }, [section]);

  return null;
}
