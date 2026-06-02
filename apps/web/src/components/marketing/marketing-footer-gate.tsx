"use client";

import type { ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";

export type MarketingFooterGateProps = {
  children: ReactNode;
};

/** Hides layout footer on home — the home page renders the same footer in-page. */
export function MarketingFooterGate({ children }: MarketingFooterGateProps) {
  const pathname = usePathname();
  const isMarketingHome = pathname === "/" || pathname === "";
  if (isMarketingHome) return null;
  return children;
}
