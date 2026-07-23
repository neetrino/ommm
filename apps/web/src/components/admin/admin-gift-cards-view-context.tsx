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
  ADMIN_GIFT_CARDS_VIEW_QUERY_KEY,
  parseAdminGiftCardsViewMode,
  type AdminGiftCardsViewMode,
} from "@/lib/admin-gift-cards-view-preference";

type AdminGiftCardsViewContextValue = {
  viewMode: AdminGiftCardsViewMode;
  setViewMode: (mode: AdminGiftCardsViewMode) => void;
};

const AdminGiftCardsViewContext = createContext<AdminGiftCardsViewContextValue | null>(
  null,
);

type AdminGiftCardsViewProviderProps = {
  children: ReactNode;
};

export function AdminGiftCardsViewProvider({ children }: AdminGiftCardsViewProviderProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const viewMode = useMemo(
    () => parseAdminGiftCardsViewMode(searchParams.get(ADMIN_GIFT_CARDS_VIEW_QUERY_KEY)),
    [searchParams],
  );

  const setViewMode = useCallback(
    (mode: AdminGiftCardsViewMode) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(ADMIN_GIFT_CARDS_VIEW_QUERY_KEY, mode);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
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
