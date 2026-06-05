"use client";

import { useEffect, useState, type ReactNode } from "react";
import { isMarketingHomePath } from "@/components/marketing/marketing-route-utils";
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
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const marketingPath = hasHydrated
    ? (clientPathname ?? serverMarketingPath)
    : serverMarketingPath;

  if (isMarketingHomePath(marketingPath)) {
    return null;
  }

  return children;
}
