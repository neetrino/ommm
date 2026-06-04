"use client";

import type { ReactNode } from "react";
import shellStyles from "@/components/marketing/marketing-coaches-page-shell.module.css";
import mainStyles from "@/components/marketing/marketing-layout-main.module.css";
import {
  isMarketingCoachesPath,
  isMarketingHomePath,
  isMarketingInnerPath,
} from "@/components/marketing/marketing-route-utils";
import { usePathname } from "@/i18n/navigation";

const MARKETING_MAIN_BASE_CLASS =
  "flex min-h-0 w-full min-w-0 flex-1 flex-col";

/** Clears fixed marketing header from tablet up (744px+); taller bar at nav-desktop (1367px+). */
const MARKETING_MAIN_INNER_TOP_PAD_CLASS = "tablet:pt-14 lg:pt-16 nav-desktop:pt-20";

/** Mobile — fixed header is out of flow; pad inner routes below the bar. */
const MARKETING_MAIN_MOBILE_INNER_PAD_CLASS = mainStyles.innerMainPad;

type MarketingLayoutMainProps = {
  children: ReactNode;
};

/**
 * Offset page content below the fixed marketing header (same as Home) on inner routes.
 */
export function MarketingLayoutMain({ children }: MarketingLayoutMainProps) {
  const pathname = usePathname() ?? "";
  const isCoachesPage = isMarketingCoachesPath(pathname);
  const usesFullBleedSurface = isMarketingHomePath(pathname) || isCoachesPage;
  const needsMobileHeaderPad = isMarketingInnerPath(pathname) && !isCoachesPage;
  const mainClassName = [
    MARKETING_MAIN_BASE_CLASS,
    isMarketingInnerPath(pathname) ? shellStyles.mainSurface : "",
    needsMobileHeaderPad ? MARKETING_MAIN_MOBILE_INNER_PAD_CLASS : "",
    usesFullBleedSurface ? "" : MARKETING_MAIN_INNER_TOP_PAD_CLASS,
  ]
    .filter(Boolean)
    .join(" ");

  return <main className={mainClassName}>{children}</main>;
}
