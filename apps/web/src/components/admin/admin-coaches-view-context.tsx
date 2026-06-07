"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  ADMIN_COACHES_VIEW_QUERY_KEY,
  parseAdminCoachesViewMode,
  type AdminCoachesViewMode,
} from "@/lib/admin-coaches-view-preference";

type AdminCoachesViewContextValue = {
  viewMode: AdminCoachesViewMode;
  setViewMode: (mode: AdminCoachesViewMode) => void;
};

const AdminCoachesViewContext = createContext<AdminCoachesViewContextValue | null>(
  null,
);

type AdminCoachesViewProviderProps = {
  children: ReactNode;
};

export function AdminCoachesViewProvider({ children }: AdminCoachesViewProviderProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const viewMode = useMemo(
    () => parseAdminCoachesViewMode(searchParams.get(ADMIN_COACHES_VIEW_QUERY_KEY)),
    [searchParams],
  );

  const setViewMode = useCallback(
    (mode: AdminCoachesViewMode) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(ADMIN_COACHES_VIEW_QUERY_KEY, mode);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

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
