"use client";

import type { CSSProperties, ReactNode } from "react";
import { COACHES_PAGE_SURFACE } from "@/components/marketing/coaches/coaches-page-tokens";
import { HOME_FOOTER_MOBILE_LAYOUT } from "@/components/marketing/home/home-footer-section-tokens";
import {
  MARKETING_CONTENT_INLINE_INSET,
  MARKETING_CONTENT_INLINE_MARGIN,
  MARKETING_CONTENT_MAX_WIDTH_PX,
} from "@/components/marketing/marketing-content-layout";
import "@/components/marketing/marketing-inner-page-align.module.css";
import shellStyles from "@/components/marketing/marketing-coaches-page-shell.module.css";
import { isMarketingHomePath } from "@/components/marketing/marketing-route-utils";
import { MARKETING_MOBILE_HEADER } from "@/components/marketing/marketing-site-header-layout";
import { usePathname } from "@/i18n/navigation";

type MarketingLayoutShellProps = {
  children: ReactNode;
};

const MARKETING_SHELL_STYLE = {
  "--marketing-mobile-header-height": MARKETING_MOBILE_HEADER.shellHeight,
} as CSSProperties;

const MARKETING_HOME_SHELL_STYLE = {
  ...MARKETING_SHELL_STYLE,
  "--marketing-footer-mobile-overlap": HOME_FOOTER_MOBILE_LAYOUT.galleryOverlap,
} as CSSProperties;

const MARKETING_INNER_SHELL_STYLE = {
  ...MARKETING_SHELL_STYLE,
  "--ommm-content-max-width": `${MARKETING_CONTENT_MAX_WIDTH_PX}px`,
  "--ommm-content-inline-margin": MARKETING_CONTENT_INLINE_MARGIN,
  "--marketing-content-inline-inset": MARKETING_CONTENT_INLINE_INSET,
  "--coaches-page-gradient-from": COACHES_PAGE_SURFACE.gradientFrom,
  "--coaches-page-gradient-to": COACHES_PAGE_SURFACE.gradientTo,
  "--home-footer-wrap-bg": COACHES_PAGE_SURFACE.gradientTo,
  "--marketing-footer-mobile-overlap": HOME_FOOTER_MOBILE_LAYOUT.galleryOverlap,
} as CSSProperties;

/**
 * Marketing route shell — home keeps wellness bg; all inner routes use coaches gradient.
 */
export function MarketingLayoutShell({ children }: MarketingLayoutShellProps) {
  const pathname = usePathname() ?? "";

  if (isMarketingHomePath(pathname)) {
    return (
      <div
        className="marketing-layout-shell ommm-bg-wellness flex min-h-screen w-full min-w-0 flex-col overflow-x-clip"
        style={MARKETING_HOME_SHELL_STYLE}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`marketing-layout-shell ${shellStyles.shell}`}
      data-marketing-inner="true"
      style={MARKETING_INNER_SHELL_STYLE}
    >
      {children}
    </div>
  );
}
