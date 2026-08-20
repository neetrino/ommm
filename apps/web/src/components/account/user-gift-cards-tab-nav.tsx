"use client";

import { useTranslations } from "next-intl";
import {
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
  activeTab,
  onTabChange,
  className = "",
  embeddedInSheet = false,
}: {
  activeTab: UserGiftCardsTab;
  onTabChange: (tab: UserGiftCardsTab) => void;
  className?: string;
  embeddedInSheet?: boolean;
}) {
  const t = useTranslations("userPages.giftCards.tabs");

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
            onClick={() => onTabChange(tab)}
            className={`${active ? USER_GIFT_CARDS_TAB_ACTIVE_CLASS : USER_GIFT_CARDS_TAB_CLASS}${tabButtonClass}`}
          >
            {t(TAB_LABEL_KEY[tab])}
          </button>
        );
      })}
    </nav>
  );
}
