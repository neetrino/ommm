"use client";

import type { ReactNode } from "react";
import shellStyles from "@/components/marketing/marketing-coaches-page-shell.module.css";
import { isMarketingInnerPath } from "@/components/marketing/marketing-route-utils";
import { usePathname } from "@/i18n/navigation";

const MARKETING_MAIN_BASE_CLASS =
  "flex min-h-0 w-full min-w-0 flex-1 flex-col";

type MarketingLayoutMainProps = {
  children: ReactNode;
};

/**
 * Inner routes offset the fixed header via {@link MarketingPublicPageSection} hero padding (coaches parity).
 */
export function MarketingLayoutMain({ children }: MarketingLayoutMainProps) {
  const pathname = usePathname() ?? "";
  const mainClassName = [
    MARKETING_MAIN_BASE_CLASS,
    isMarketingInnerPath(pathname) ? shellStyles.mainSurface : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <main className={mainClassName}>{children}</main>;
}
