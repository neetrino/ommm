"use client";

import type { ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";

const MARKETING_MAIN_BASE_CLASS =
  "flex min-h-0 w-full min-w-0 flex-1 flex-col";

const MARKETING_MAIN_INNER_TOP_PAD_CLASS = "pt-16 sm:pt-20";

type MarketingLayoutMainProps = {
  children: ReactNode;
};

/**
 * Offset page content below the fixed marketing header (same as Home) on inner routes.
 */
export function MarketingLayoutMain({ children }: MarketingLayoutMainProps) {
  const pathname = usePathname() ?? "";
  const isMarketingHome = pathname === "/" || pathname === "";
  const mainClassName = isMarketingHome
    ? MARKETING_MAIN_BASE_CLASS
    : [MARKETING_MAIN_BASE_CLASS, MARKETING_MAIN_INNER_TOP_PAD_CLASS].join(" ");

  return <main className={mainClassName}>{children}</main>;
}
