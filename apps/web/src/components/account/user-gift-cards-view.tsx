"use client";

import { useCallback, useState, type ReactNode } from "react";
import { UserGiftCardsPageHero } from "@/components/account/user-gift-cards-page-hero";
import {
  DEFAULT_USER_GIFT_CARDS_TAB,
  USER_GIFT_CARDS_TAB_PARAM,
  type UserGiftCardsTab,
} from "@/lib/user-gift-cards-tab";

type UserGiftCardsViewProps = {
  title: string;
  locale: string;
  giftBalanceCents: number | null;
  embeddedInSheet?: boolean;
  initialTab: UserGiftCardsTab;
  myPanel: ReactNode;
  shopPanel: ReactNode;
};

/** Client tab switch so My / Buy updates immediately without waiting for an RSC refresh. */
export function UserGiftCardsView({
  title,
  locale,
  giftBalanceCents,
  embeddedInSheet = false,
  initialTab,
  myPanel,
  shopPanel,
}: UserGiftCardsViewProps) {
  const [tab, setTabState] = useState(initialTab);

  const setTab = useCallback((next: UserGiftCardsTab) => {
    setTabState(next);
    replaceGiftCardsTabInUrl(next);
  }, []);

  return (
    <div className="space-y-4">
      <UserGiftCardsPageHero
        title={title}
        locale={locale}
        giftBalanceCents={giftBalanceCents}
        embeddedInSheet={embeddedInSheet}
        activeTab={tab}
        onTabChange={setTab}
      />
      {tab === "shop" ? shopPanel : myPanel}
    </div>
  );
}

function replaceGiftCardsTabInUrl(next: UserGiftCardsTab): void {
  const url = new URL(window.location.href);
  if (next === DEFAULT_USER_GIFT_CARDS_TAB) {
    url.searchParams.delete(USER_GIFT_CARDS_TAB_PARAM);
  } else {
    url.searchParams.set(USER_GIFT_CARDS_TAB_PARAM, next);
  }
  window.history.replaceState(window.history.state, "", url);
}
