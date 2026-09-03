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

const TAB_LABEL_KEY: Record<UserBookingsTab, string> = {
  perfect: "perfect",
  past: "past",
};

const TRACK_CLASS =
  "relative inline-grid shrink-0 grid-cols-2 rounded-full bg-[#f0efed] p-1";

const THUMB_CLASS = [
  "pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full",
  "bg-[var(--ommm-admin-olive)] shadow-sm",
  "transition-transform duration-300 ease-out motion-reduce:transition-none",
].join(" ");

const SEGMENT_CLASS = [
  "relative z-10 inline-flex min-w-[6.75rem] cursor-pointer items-center justify-center",
  "rounded-full px-5 py-2.5 text-sm font-semibold",
  "transition-colors duration-300 ease-out motion-reduce:transition-none",
  "active:scale-[0.985]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ommm-admin-olive)]/40",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
].join(" ");

function thumbOffsetClass(activeTab: UserBookingsTab): string {
  return activeTab === "past" ? "translate-x-full" : "translate-x-0";
}

function segmentClassName(active: boolean): string {
  return active
    ? `${SEGMENT_CLASS} text-[var(--ommm-admin-cream)]`
    : `${SEGMENT_CLASS} text-sage-800`;
}

/** Current / Past segmented switcher for My Bookings. */
export function UserBookingsTabNav({ className = "" }: { className?: string }) {
  const t = useTranslations("userPages.bookings.tabs");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = parseUserBookingsTab(Object.fromEntries(searchParams.entries()));

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
      className={`${TRACK_CLASS} ${className}`.trim()}
    >
      <span aria-hidden className={`${THUMB_CLASS} ${thumbOffsetClass(activeTab)}`} />
      {USER_BOOKINGS_TABS.map((tab) => {
        const active = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active}
            aria-pressed={active}
            className={segmentClassName(active)}
            onClick={() => setTab(tab)}
          >
            {t(TAB_LABEL_KEY[tab])}
          </button>
        );
      })}
    </div>
  );
}
