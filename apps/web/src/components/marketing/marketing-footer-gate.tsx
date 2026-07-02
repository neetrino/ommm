"use client";

import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { MarketingScrollReveal } from "@/components/marketing/marketing-scroll-reveal";
import {
  isMarketingHomePath,
  isMarketingPracticesInnerPath,
  isMarketingScrollRevealFooterPath,
} from "@/components/marketing/marketing-route-utils";
import { useIsClientMounted } from "@/hooks/use-is-client-mounted";
import { usePathname } from "@/i18n/navigation";

/** Single footer block — row stagger is not used. */
const MARKETING_FOOTER_REVEAL_GRID_COLUMNS = 1;

/** Matches marketing footer / header phone breakpoint. */
const MARKETING_PHONE_MEDIA_QUERY = "(max-width: 743px)";

function subscribeMarketingPhoneViewport(onStoreChange: () => void): () => void {
  const mediaQuery = window.matchMedia(MARKETING_PHONE_MEDIA_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getMarketingPhoneViewportSnapshot(): boolean {
  return window.matchMedia(MARKETING_PHONE_MEDIA_QUERY).matches;
}

function getMarketingPhoneViewportServerSnapshot(): boolean {
  return false;
}

function useIsMarketingPhoneViewport(): boolean {
  return useSyncExternalStore(
    subscribeMarketingPhoneViewport,
    getMarketingPhoneViewportSnapshot,
    getMarketingPhoneViewportServerSnapshot,
  );
}

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
  const isPhoneViewport = useIsMarketingPhoneViewport();

  const marketingPath = hasHydrated
    ? (clientPathname ?? serverMarketingPath)
    : serverMarketingPath;

  if (isMarketingHomePath(marketingPath)) {
    return null;
  }

  const skipScrollReveal =
    isMarketingPracticesInnerPath(marketingPath) && isPhoneViewport;

  if (!skipScrollReveal && isMarketingScrollRevealFooterPath(marketingPath)) {
    return (
      <MarketingScrollReveal
        index={0}
        gridColumns={MARKETING_FOOTER_REVEAL_GRID_COLUMNS}
        className="marketing-footer-reveal"
      >
        {children}
      </MarketingScrollReveal>
    );
  }

  return children;
}
