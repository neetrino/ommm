"use client";

import type { ReactNode } from "react";
import shellStyles from "@/components/marketing/marketing-coaches-page-shell.module.css";
import {
  isMarketingCoachesPath,
  isMarketingHomePath,
} from "@/components/marketing/marketing-route-utils";
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
  const isCoachesPage = isMarketingCoachesPath(pathname);
  const usesFullBleedSurface =
    isMarketingHomePath(pathname) || isCoachesPage;
  const mainClassName = [
    MARKETING_MAIN_BASE_CLASS,
    isCoachesPage ? shellStyles.mainSurface : "",
    usesFullBleedSurface ? "" : MARKETING_MAIN_INNER_TOP_PAD_CLASS,
  ]
    .filter(Boolean)
    .join(" ");

  return <main className={mainClassName}>{children}</main>;
}
