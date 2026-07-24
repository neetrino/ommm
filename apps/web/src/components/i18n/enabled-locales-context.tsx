"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  createDefaultEnabledLocales,
  type EnabledLocalesMap,
} from "@/lib/enabled-locales";

const EnabledLocalesContext = createContext<EnabledLocalesMap>(
  createDefaultEnabledLocales(),
);

type EnabledLocalesProviderProps = {
  locales: EnabledLocalesMap;
  children: ReactNode;
};

export function EnabledLocalesProvider({
  locales,
  children,
}: EnabledLocalesProviderProps) {
  return (
    <EnabledLocalesContext.Provider value={locales}>
      {children}
    </EnabledLocalesContext.Provider>
  );
}

export function useEnabledLocales(): EnabledLocalesMap {
  return useContext(EnabledLocalesContext);
}
