import type { ReactNode } from "react";
import { MarketingSectionsVisibilityProvider } from "@/components/marketing/marketing-sections-visibility-context";
import { getHomeSectionsVisibility } from "@/server/home-sections-visibility";

type MarketingSectionsVisibilityBoundaryProps = {
  children: ReactNode;
};

/** Server wrapper — supplies home section visibility to client marketing links. */
export async function MarketingSectionsVisibilityBoundary({
  children,
}: MarketingSectionsVisibilityBoundaryProps) {
  const visibility = await getHomeSectionsVisibility();

  return (
    <MarketingSectionsVisibilityProvider visibility={visibility}>
      {children}
    </MarketingSectionsVisibilityProvider>
  );
}
