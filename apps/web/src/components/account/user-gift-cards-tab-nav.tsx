"use client";

import { useTranslations } from "next-intl";
import {
  USER_GIFT_CARDS_TABS,
  type UserGiftCardsTab,
} from "@/lib/user-gift-cards-tab";
import {
  oliveSegmentedSegmentClassName,
  oliveSegmentedThumbClass,
  oliveSegmentedTrackClass,
} from "@/components/ui/olive-segmented-switcher";

const TAB_LABEL_KEY: Record<UserGiftCardsTab, string> = {
  my: "my",
  shop: "shop",
};

const GIFT_CARDS_SWITCHER_COLUMN_COUNT = 2;

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
  const activeIndex = Math.max(0, USER_GIFT_CARDS_TABS.indexOf(activeTab));
  void embeddedInSheet;

  return (
    <div
      role="tablist"
      aria-label={t("aria")}
      className={oliveSegmentedTrackClass(
        GIFT_CARDS_SWITCHER_COLUMN_COUNT,
        className,
      )}
    >
      <span
        aria-hidden
        className={oliveSegmentedThumbClass(
          GIFT_CARDS_SWITCHER_COLUMN_COUNT,
          activeIndex,
        )}
      />
      {USER_GIFT_CARDS_TABS.map((tab) => {
        const active = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active}
            aria-pressed={active}
            onClick={() => onTabChange(tab)}
            className={oliveSegmentedSegmentClassName(
              active,
              GIFT_CARDS_SWITCHER_COLUMN_COUNT,
            )}
          >
            {t(TAB_LABEL_KEY[tab])}
          </button>
        );
      })}
    </div>
  );
}
