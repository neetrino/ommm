"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { UserGiftCardsBalanceDisplay } from "@/components/account/user-gift-cards-balance-display";
import {
  USER_GIFT_CARDS_TAB_ACTIVE_CLASS,
  USER_GIFT_CARDS_TAB_CLASS,
  UserGiftCardsTabNav,
} from "@/components/account/user-gift-cards-tab-nav";
import { useAdminStickyHeaderOffset } from "@/components/shell/use-admin-sticky-header-offset";
import { WorkspaceStickyPageHeader } from "@/components/shell/workspace-sticky-page-header";

type UserGiftCardsPageHeroProps = {
  title: string;
  locale: string;
  giftBalanceCents: number | null;
};

function UserGiftCardsPageHeroInner({
  title,
  locale,
  giftBalanceCents,
}: UserGiftCardsPageHeroProps) {
  const t = useTranslations("userPages.giftCards");
  const headerRef = useAdminStickyHeaderOffset(true);

  return (
    <WorkspaceStickyPageHeader headerRef={headerRef} spacing="hero">
      <div className="ommm-admin-header-bar flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-4">
          <h1 className="ommm-admin-header-title">{title}</h1>
          <UserGiftCardsTabNav />
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

function UserGiftCardsPageHeroFallback({ title }: { title: string }) {
  const t = useTranslations("userPages.giftCards.tabs");
  const headerRef = useAdminStickyHeaderOffset(true);

  return (
    <WorkspaceStickyPageHeader headerRef={headerRef} spacing="hero">
      <div className="ommm-admin-header-bar flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-4">
          <h1 className="ommm-admin-header-title">{title}</h1>
          <nav
            role="tablist"
            aria-label={t("aria")}
            className="flex min-w-0 shrink-0 items-center gap-3 overflow-x-auto pb-1"
          >
            <span className={USER_GIFT_CARDS_TAB_ACTIVE_CLASS}>{t("my")}</span>
            <span className={USER_GIFT_CARDS_TAB_CLASS}>{t("shop")}</span>
          </nav>
        </div>
      </div>
    </WorkspaceStickyPageHeader>
  );
}

/** Member gift cards page header with My / Shop pill tabs. */
export function UserGiftCardsPageHero(props: UserGiftCardsPageHeroProps) {
  return (
    <Suspense fallback={<UserGiftCardsPageHeroFallback title={props.title} />}>
      <UserGiftCardsPageHeroInner {...props} />
    </Suspense>
  );
}
