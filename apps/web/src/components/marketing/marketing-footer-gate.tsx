"use client";

import type { ReactNode } from "react";
import { MarketingScrollReveal } from "@/components/marketing/marketing-scroll-reveal";
import {
  isMarketingHomePath,
  isMarketingScrollRevealFooterPath,
} from "@/components/marketing/marketing-route-utils";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import { usePathname } from "@/i18n/navigation";

/** Single footer block — row stagger is not used. */
const MARKETING_FOOTER_REVEAL_GRID_COLUMNS = 1;

export type MarketingFooterGateProps = {
  children: ReactNode;
  /** Locale-free path from the server request — stable through hydration. */
  serverMarketingPath: string;
};

/** Hides layout footer on home — the home page renders the same footer in-page. */
export function MarketingFooterGate({
  children,
  serverMarketingPath,
}: MarketingFooterGateProps) {
  const clientPathname = usePathname();
  const hasHydrated = useIsClientMounted();

  const marketingPath = hasHydrated
    ? (clientPathname ?? serverMarketingPath)
    : serverMarketingPath;

  if (isMarketingHomePath(marketingPath)) {
    return null;
  }

  if (isMarketingScrollRevealFooterPath(marketingPath)) {
    return (
      <MarketingScrollReveal index={0} gridColumns={MARKETING_FOOTER_REVEAL_GRID_COLUMNS}>
        {children}
      </MarketingScrollReveal>
    );
  }

  return children;
}
