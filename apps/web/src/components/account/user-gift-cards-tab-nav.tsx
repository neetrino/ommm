"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  DEFAULT_USER_GIFT_CARDS_TAB,
  parseUserGiftCardsTab,
  USER_GIFT_CARDS_TAB_PARAM,
  USER_GIFT_CARDS_TABS,
  type UserGiftCardsTab,
} from "@/lib/user-gift-cards-tab";

const TAB_LABEL_KEY: Record<UserGiftCardsTab, string> = {
  my: "my",
  shop: "shop",
};

export function UserGiftCardsTabNav({ className = "" }: { className?: string }) {
  const t = useTranslations("userPages.giftCards.tabs");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = parseUserGiftCardsTab(Object.fromEntries(searchParams.entries()));

  const setTab = useCallback(
    (tab: UserGiftCardsTab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === DEFAULT_USER_GIFT_CARDS_TAB) {
        params.delete(USER_GIFT_CARDS_TAB_PARAM);
      } else {
        params.set(USER_GIFT_CARDS_TAB_PARAM, tab);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <nav
      role="tablist"
      aria-label={t("aria")}
      className={`flex min-w-0 shrink-0 items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {USER_GIFT_CARDS_TABS.map((tab) => {
        const active = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setTab(tab)}
            className={
              active
                ? "ommm-admin-pill-tab ommm-admin-pill-tab-active shrink-0 px-4 normal-case tracking-normal"
                : "ommm-admin-pill-tab shrink-0 px-4 normal-case tracking-normal"
            }
          >
            {t(TAB_LABEL_KEY[tab])}
          </button>
        );
      })}
    </nav>
  );
}
