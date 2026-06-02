"use client";

import type { CSSProperties, ReactNode } from "react";
import { COACHES_PAGE_SURFACE } from "@/components/marketing/coaches/coaches-page-tokens";
import shellStyles from "@/components/marketing/marketing-coaches-page-shell.module.css";
import { isMarketingCoachesPath } from "@/components/marketing/marketing-route-utils";
import { usePathname } from "@/i18n/navigation";

type MarketingLayoutShellProps = {
  children: ReactNode;
};

const COACHES_SHELL_STYLE = {
  "--coaches-page-gradient-from": COACHES_PAGE_SURFACE.gradientFrom,
  "--coaches-page-gradient-to": COACHES_PAGE_SURFACE.gradientTo,
  "--home-footer-wrap-bg": COACHES_PAGE_SURFACE.gradientTo,
} as CSSProperties;

/**
 * Marketing route shell — coaches page uses Figma full-bleed gradient; others use wellness bg.
 */
export function MarketingLayoutShell({ children }: MarketingLayoutShellProps) {
  const pathname = usePathname() ?? "";

  if (isMarketingCoachesPath(pathname)) {
    return (
      <div className={shellStyles.shell} style={COACHES_SHELL_STYLE}>
        {children}
      </div>
    );
  }

  return (
    <div className="ommm-bg-wellness flex min-h-screen w-full flex-col">{children}</div>
  );
}
