"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  DEFAULT_USER_BOOKINGS_TAB,
  parseUserBookingsTab,
  USER_BOOKINGS_TAB_PARAM,
  USER_BOOKINGS_TABS,
  type UserBookingsTab,
} from "@/lib/user-bookings-tab";
import {
  oliveSegmentedSegmentClassName,
  oliveSegmentedThumbClass,
  oliveSegmentedTrackClass,
} from "@/components/ui/olive-segmented-switcher";

const TAB_LABEL_KEY: Record<UserBookingsTab, string> = {
  perfect: "perfect",
  past: "past",
};

const BOOKINGS_SWITCHER_COLUMN_COUNT = 2;

/** Current / Past segmented switcher for My Bookings. */
export function UserBookingsTabNav({ className = "" }: { className?: string }) {
  const t = useTranslations("userPages.bookings.tabs");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = parseUserBookingsTab(Object.fromEntries(searchParams.entries()));
  const activeIndex = Math.max(0, USER_BOOKINGS_TABS.indexOf(activeTab));

  const setTab = useCallback(
    (nextTab: UserBookingsTab) => {
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

  return (
    <div
      role="tablist"
      aria-label={t("aria")}
      className={oliveSegmentedTrackClass(BOOKINGS_SWITCHER_COLUMN_COUNT, className)}
    >
      <span
        aria-hidden
        className={oliveSegmentedThumbClass(BOOKINGS_SWITCHER_COLUMN_COUNT, activeIndex)}
      />
      {USER_BOOKINGS_TABS.map((tab) => {
        const active = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active}
            className={oliveSegmentedSegmentClassName(active, BOOKINGS_SWITCHER_COLUMN_COUNT)}
            onClick={() => setTab(tab)}
          >
            {t(TAB_LABEL_KEY[tab])}
          </button>
        );
      })}
    </div>
  );
}
