"use client";

import type { ReactNode } from "react";
import { isMarketingHomePath } from "@/components/marketing/marketing-route-utils";
import { usePathname } from "@/i18n/navigation";

export type MarketingFooterGateProps = {
  children: ReactNode;
};

/** Hides layout footer on home — the home page renders the same footer in-page. */
export function MarketingFooterGate({ children }: MarketingFooterGateProps) {
  const pathname = usePathname() ?? "";
  if (isMarketingHomePath(pathname)) return null;
  return children;
}
