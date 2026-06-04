"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AdminGiftCardsViewMode } from "@/lib/admin-gift-cards-view-preference";

type AdminGiftCardsViewContextValue = {
  viewMode: AdminGiftCardsViewMode;
  setViewMode: (mode: AdminGiftCardsViewMode) => void;
};

const AdminGiftCardsViewContext = createContext<AdminGiftCardsViewContextValue | null>(
  null,
);

type AdminGiftCardsViewProviderProps = {
  initialViewMode: AdminGiftCardsViewMode;
  children: ReactNode;
};

export function AdminGiftCardsViewProvider({
  initialViewMode,
  children,
}: AdminGiftCardsViewProviderProps) {
  const [viewMode, setViewModeState] = useState<AdminGiftCardsViewMode>(initialViewMode);

  const setViewMode = useCallback((mode: AdminGiftCardsViewMode) => {
    setViewModeState(mode);
  }, []);

  const value = useMemo(
    () => ({
      viewMode,
      setViewMode,
    }),
    [viewMode, setViewMode],
  );

  return (
    <AdminGiftCardsViewContext.Provider value={value}>
      {children}
    </AdminGiftCardsViewContext.Provider>
  );
}

export function useAdminGiftCardsView(): AdminGiftCardsViewContextValue {
  const context = useContext(AdminGiftCardsViewContext);
  if (context === null) {
    throw new Error("useAdminGiftCardsView must be used within AdminGiftCardsViewProvider");
  }
  return context;
}
