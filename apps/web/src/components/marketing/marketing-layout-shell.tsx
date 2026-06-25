import type { CSSProperties, ReactNode } from "react";
import { COACHES_PAGE_SURFACE } from "@/components/marketing/coaches/coaches-page-tokens";
import { HOME_FOOTER_MOBILE_LAYOUT } from "@/components/marketing/home/home-footer-section-tokens";
import { POLICY_PAGE_SURFACE } from "@/components/marketing/policy/policy-page-tokens";
import {
  MARKETING_CONTENT_INLINE_INSET,
  MARKETING_CONTENT_INLINE_MARGIN,
  MARKETING_CONTENT_MAX_WIDTH_PX,
} from "@/components/marketing/marketing-content-layout";
import "@/components/marketing/marketing-inner-page-align.module.css";
import shellStyles from "@/components/marketing/marketing-coaches-page-shell.module.css";
import { MARKETING_MOBILE_HEADER } from "@/components/marketing/marketing-site-header-layout";

type MarketingLayoutShellProps = {
  children: ReactNode;
};

const MARKETING_SHELL_STYLE = {
  "--marketing-mobile-header-height": MARKETING_MOBILE_HEADER.shellHeight,
  "--ommm-content-max-width": `${MARKETING_CONTENT_MAX_WIDTH_PX}px`,
  "--ommm-content-inline-margin": MARKETING_CONTENT_INLINE_MARGIN,
  "--marketing-content-inline-inset": MARKETING_CONTENT_INLINE_INSET,
  "--coaches-page-gradient-from": COACHES_PAGE_SURFACE.gradientFrom,
  "--coaches-page-gradient-to": COACHES_PAGE_SURFACE.gradientTo,
  "--policy-page-background": POLICY_PAGE_SURFACE.background,
  "--home-footer-wrap-bg": COACHES_PAGE_SURFACE.gradientTo,
  "--marketing-footer-mobile-overlap": HOME_FOOTER_MOBILE_LAYOUT.galleryOverlap,
} as CSSProperties;

/**
 * Marketing route shell — home vs inner background follows mounted page markers (`:has()`).
 */
export function MarketingLayoutShell({ children }: MarketingLayoutShellProps) {
  return (
    <div
      className={`marketing-layout-shell ${shellStyles.shell}`}
      style={MARKETING_SHELL_STYLE}
    >
      {children}
    </div>
  );
}
