"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AdminCoachesViewMode } from "@/lib/admin-coaches-view-preference";

type AdminCoachesViewContextValue = {
  viewMode: AdminCoachesViewMode;
  setViewMode: (mode: AdminCoachesViewMode) => void;
};

const AdminCoachesViewContext = createContext<AdminCoachesViewContextValue | null>(
  null,
);

type AdminCoachesViewProviderProps = {
  initialViewMode: AdminCoachesViewMode;
  children: ReactNode;
};

export function AdminCoachesViewProvider({
  initialViewMode,
  children,
}: AdminCoachesViewProviderProps) {
  const [viewMode, setViewModeState] = useState<AdminCoachesViewMode>(initialViewMode);

  const setViewMode = useCallback((mode: AdminCoachesViewMode) => {
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
    <AdminCoachesViewContext.Provider value={value}>
      {children}
    </AdminCoachesViewContext.Provider>
  );
}

export function useAdminCoachesView(): AdminCoachesViewContextValue {
  const context = useContext(AdminCoachesViewContext);
  if (context === null) {
    throw new Error("useAdminCoachesView must be used within AdminCoachesViewProvider");
  }
  return context;
}
