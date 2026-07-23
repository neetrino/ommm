"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { AdminPillTabs } from "@/components/admin/admin-pill-tabs";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  DEFAULT_USER_BOOKINGS_TAB,
  parseUserBookingsTab,
  USER_BOOKINGS_TAB_PARAM,
  USER_BOOKINGS_TABS,
  type UserBookingsTab,
} from "@/lib/user-bookings-tab";

const TAB_LABEL_KEY: Record<UserBookingsTab, string> = {
  past: "past",
  perfect: "perfect",
};

export function UserBookingsTabNav({ className = "" }: { className?: string }) {
  const t = useTranslations("userPages.bookings.tabs");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = parseUserBookingsTab(Object.fromEntries(searchParams.entries()));

  const setTab = useCallback(
    (tab: string) => {
      const nextTab = tab as UserBookingsTab;
      const params = new URLSearchParams(searchParams.toString());
      if (nextTab === DEFAULT_USER_BOOKINGS_TAB) {
        params.delete(USER_BOOKINGS_TAB_PARAM);
      } else {
        params.set(USER_BOOKINGS_TAB_PARAM, nextTab);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const items = USER_BOOKINGS_TABS.map((tab) => ({
    id: tab,
    label: t(TAB_LABEL_KEY[tab]),
  }));

  return (
    <div className={className}>
      <AdminPillTabs
        items={items}
        activeId={activeTab}
        onChange={setTab}
        ariaLabel={t("aria")}
      />
    </div>
  );
}
