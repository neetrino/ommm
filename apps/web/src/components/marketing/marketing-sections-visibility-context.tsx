"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  createDefaultHomePageSectionVisibility,
  type HomePageSectionVisibility,
} from "@/lib/home-page-sections";

const MarketingSectionsVisibilityContext = createContext<HomePageSectionVisibility>(
  createDefaultHomePageSectionVisibility(),
);

type MarketingSectionsVisibilityProviderProps = {
  visibility: HomePageSectionVisibility;
  children: ReactNode;
};

export function MarketingSectionsVisibilityProvider({
  visibility,
  children,
}: MarketingSectionsVisibilityProviderProps) {
  return (
    <MarketingSectionsVisibilityContext.Provider value={visibility}>
      {children}
    </MarketingSectionsVisibilityContext.Provider>
  );
}

export function useMarketingSectionsVisibility(): HomePageSectionVisibility {
  return useContext(MarketingSectionsVisibilityContext);
}
