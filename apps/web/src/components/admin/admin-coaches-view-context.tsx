"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  persistAdminCoachesViewPreference,
  readAdminCoachesViewPreference,
  type AdminCoachesViewMode,
} from "@/lib/admin-coaches-view-preference";

type AdminCoachesViewContextValue = {
  viewMode: AdminCoachesViewMode;
  setViewMode: (mode: AdminCoachesViewMode) => void;
};

const AdminCoachesViewContext = createContext<AdminCoachesViewContextValue | null>(
  null,
);

export function AdminCoachesViewProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewModeState] = useState<AdminCoachesViewMode>("list");

  useEffect(() => {
    try {
      const saved = readAdminCoachesViewPreference();
      if (saved !== "list") {
        startTransition(() => {
          setViewModeState(saved);
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setViewMode = useCallback((mode: AdminCoachesViewMode) => {
    setViewModeState(mode);
    persistAdminCoachesViewPreference(mode);
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
