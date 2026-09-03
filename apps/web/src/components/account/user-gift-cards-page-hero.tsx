"use client";

import { useTranslations } from "next-intl";
import { UserGiftCardsBalanceDisplay } from "@/components/account/user-gift-cards-balance-display";
import { UserGiftCardsTabNav } from "@/components/account/user-gift-cards-tab-nav";
import { useAdminStickyHeaderOffset } from "@/components/shell/use-admin-sticky-header-offset";
import { WorkspaceStickyPageHeader } from "@/components/shell/workspace-sticky-page-header";
import type { UserGiftCardsTab } from "@/lib/user-gift-cards-tab";

type UserGiftCardsPageHeroProps = {
  title: string;
  locale: string;
  giftBalanceCents: number | null;
  activeTab: UserGiftCardsTab;
  onTabChange: (tab: UserGiftCardsTab) => void;
  /** Compact tabs + balance for the mobile hub bottom sheet (title lives in sheet chrome). */
  embeddedInSheet?: boolean;
};

/** Member gift cards page header with My / Buy segmented switcher. */
export function UserGiftCardsPageHero({
  title,
  locale,
  giftBalanceCents,
  activeTab,
  onTabChange,
  embeddedInSheet = false,
}: UserGiftCardsPageHeroProps) {
  const t = useTranslations("userPages.giftCards");
  const headerRef = useAdminStickyHeaderOffset(!embeddedInSheet);
  const tabNav = (
    <UserGiftCardsTabNav
      activeTab={activeTab}
      onTabChange={onTabChange}
      embeddedInSheet={embeddedInSheet}
    />
  );

  if (embeddedInSheet) {
    return (
      <div className="flex flex-col items-stretch gap-3 pb-1">
        {tabNav}
        {giftBalanceCents !== null ? (
          <UserGiftCardsBalanceDisplay
            embeddedInSheet
            label={t("giftBalanceLabel")}
            amountCents={giftBalanceCents}
            locale={locale}
          />
        ) : null}
      </div>
    );
  }

  return (
    <WorkspaceStickyPageHeader headerRef={headerRef} spacing="hero">
      <div className="ommm-admin-header-bar flex-col items-stretch gap-3 max-sm:justify-center sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 w-full shrink-0 flex-wrap items-center justify-center gap-4 sm:w-auto sm:justify-start">
          <h1 className="ommm-admin-header-title">{title}</h1>
          {tabNav}
        </div>
        {giftBalanceCents !== null ? (
          <UserGiftCardsBalanceDisplay
            label={t("giftBalanceLabel")}
            amountCents={giftBalanceCents}
            locale={locale}
          />
        ) : null}
      </div>
    </WorkspaceStickyPageHeader>
  );
}
