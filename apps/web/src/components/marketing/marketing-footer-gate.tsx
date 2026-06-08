"use client";

import type { ReactNode } from "react";
import { CoachesPageReveal } from "@/components/marketing/coaches/coaches-page-reveal";
import {
  isMarketingCoachesPath,
  isMarketingHomePath,
} from "@/components/marketing/marketing-route-utils";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import { usePathname } from "@/i18n/navigation";

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

  if (isMarketingCoachesPath(marketingPath)) {
    return <CoachesPageReveal index={0}>{children}</CoachesPageReveal>;
  }

  return children;
}
