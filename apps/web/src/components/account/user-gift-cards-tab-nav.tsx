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

export const USER_GIFT_CARDS_TAB_CLASS =
  "ommm-admin-pill-tab h-auto min-h-12 shrink-0 px-6 py-2.5 text-sm font-semibold normal-case tracking-normal sm:min-h-[3.25rem] sm:px-8 sm:py-3 sm:text-base";

export const USER_GIFT_CARDS_TAB_ACTIVE_CLASS = `${USER_GIFT_CARDS_TAB_CLASS} ommm-admin-pill-tab-active`;

export function UserGiftCardsTabNav({
  className = "",
  embeddedInSheet = false,
}: {
  className?: string;
  embeddedInSheet?: boolean;
}) {
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

  const navLayoutClass = embeddedInSheet
    ? "grid w-full grid-cols-2 gap-3 overflow-visible pb-0"
    : "flex min-w-0 shrink-0 items-center gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

  const tabButtonClass = embeddedInSheet ? " w-full justify-center" : "";

  return (
    <nav
      role="tablist"
      aria-label={t("aria")}
      className={`${navLayoutClass} ${className}`.trim()}
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
            className={`${active ? USER_GIFT_CARDS_TAB_ACTIVE_CLASS : USER_GIFT_CARDS_TAB_CLASS}${tabButtonClass}`}
          >
            {t(TAB_LABEL_KEY[tab])}
          </button>
        );
      })}
    </nav>
  );
}
