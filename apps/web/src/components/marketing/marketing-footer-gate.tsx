"use client";

import type { ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";

export type MarketingFooterGateProps = {
  children: ReactNode;
};

/** Hides marketing footer on the locale home route only (`/` in next-intl pathname). */
export function MarketingFooterGate({ children }: MarketingFooterGateProps) {
  const pathname = usePathname();
  const isMarketingHome = pathname === "/" || pathname === "";
  if (isMarketingHome) return null;
  return children;
}
