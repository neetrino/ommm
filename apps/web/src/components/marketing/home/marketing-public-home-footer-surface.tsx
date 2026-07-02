"use client";

import type { CSSProperties, ReactNode } from "react";
import styles from "@/components/marketing/home/marketing-public-home-footer.module.css";
import { homeFooterStyleVars } from "@/components/marketing/home/home-footer-style-vars";
import type { HomeFooterSurfaceVariant } from "@/components/marketing/home/home-footer-section-tokens";
import { MARKETING_FOOTER_MARKER } from "@/components/marketing/marketing-route-utils";
import { useIsMarketingPhoneViewport } from "@/hooks/use-is-marketing-phone-viewport";

type MarketingPublicHomeFooterSurfaceProps = {
  children: ReactNode;
  /** Layout / inner routes — desktop and tablet default. */
  surfaceVariant?: HomeFooterSurfaceVariant;
  /** Schedule / Packages / Contact — use home footer tokens on phone only. */
  mobileHomeParity?: boolean;
};

/**
 * Footer section shell — switches to home surface on phone for practices-inner routes
 * while keeping inner surface on tablet and desktop.
 */
export function MarketingPublicHomeFooterSurface({
  children,
  surfaceVariant = "home",
  mobileHomeParity = false,
}: MarketingPublicHomeFooterSurfaceProps) {
  const isPhoneViewport = useIsMarketingPhoneViewport();
  const resolvedVariant: HomeFooterSurfaceVariant =
    mobileHomeParity && isPhoneViewport ? "home" : surfaceVariant;

  const sectionClassName =
    resolvedVariant === "inner"
      ? `${styles.sectionWrap} ${styles.sectionWrapInner}`
      : styles.sectionWrap;

  return (
    <section
      {...{ [MARKETING_FOOTER_MARKER]: "" }}
      className={sectionClassName}
      style={homeFooterStyleVars(resolvedVariant) as CSSProperties}
      suppressHydrationWarning
    >
      {children}
    </section>
  );
}
