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
  /** Compact tabs + balance for the mobile hub bottom sheet (title lives in sheet chrome). */
  embeddedInSheet?: boolean;
};

function UserGiftCardsPageHeroInner({
  title,
  locale,
  giftBalanceCents,
  embeddedInSheet = false,
}: UserGiftCardsPageHeroProps) {
  const t = useTranslations("userPages.giftCards");
  const headerRef = useAdminStickyHeaderOffset(!embeddedInSheet);

  const tabNav = <UserGiftCardsTabNav />;

  if (embeddedInSheet) {
    return (
      <div className="flex flex-col items-stretch gap-3 pb-1">
        <UserGiftCardsTabNav embeddedInSheet />
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

function UserGiftCardsPageHeroFallback({
  title,
  embeddedInSheet = false,
}: {
  title: string;
  embeddedInSheet?: boolean;
}) {
  const t = useTranslations("userPages.giftCards.tabs");
  const headerRef = useAdminStickyHeaderOffset(!embeddedInSheet);

  const tabFallback = (
    <nav
      role="tablist"
      aria-label={t("aria")}
      className="flex min-w-0 shrink-0 items-center gap-3 overflow-x-auto pb-1"
    >
      <span className={USER_GIFT_CARDS_TAB_ACTIVE_CLASS}>{t("my")}</span>
      <span className={USER_GIFT_CARDS_TAB_CLASS}>{t("shop")}</span>
    </nav>
  );

  if (embeddedInSheet) {
    return (
      <div className="pb-1">
        <UserGiftCardsTabNav embeddedInSheet />
      </div>
    );
  }

  return (
    <WorkspaceStickyPageHeader headerRef={headerRef} spacing="hero">
      <div className="ommm-admin-header-bar flex-col items-stretch gap-3 max-sm:justify-center sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 w-full shrink-0 flex-wrap items-center justify-center gap-4 sm:w-auto sm:justify-start">
          <h1 className="ommm-admin-header-title">{title}</h1>
          {tabFallback}
        </div>
      </div>
    </WorkspaceStickyPageHeader>
  );
}

/** Member gift cards page header with My / Shop pill tabs. */
export function UserGiftCardsPageHero(props: UserGiftCardsPageHeroProps) {
  return (
    <Suspense
      fallback={
        <UserGiftCardsPageHeroFallback
          title={props.title}
          embeddedInSheet={props.embeddedInSheet}
        />
      }
    >
      <UserGiftCardsPageHeroInner {...props} />
    </Suspense>
  );
}
