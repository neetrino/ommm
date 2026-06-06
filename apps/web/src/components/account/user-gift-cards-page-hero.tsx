"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { UserGiftCardsTabNav } from "@/components/account/user-gift-cards-tab-nav";
import { useAdminStickyHeaderOffset } from "@/components/shell/use-admin-sticky-header-offset";

type UserGiftCardsPageHeroProps = {
  title: string;
  description?: ReactNode;
};

function UserGiftCardsPageHeroInner({ title, description }: UserGiftCardsPageHeroProps) {
  const headerRef = useAdminStickyHeaderOffset(true);

  return (
    <header
      ref={headerRef}
      className="sticky z-20 -mx-4 mb-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      style={{ top: "var(--ommm-marketing-site-header-offset, 4.25rem)" }}
    >
      <div className="ommm-admin-header-bar flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-3">
          <div className="min-w-0">
            <h1 className="ommm-admin-header-title">{title}</h1>
            {description ? (
              <p className="mt-1 max-w-2xl text-sm text-sage-600">{description}</p>
            ) : null}
          </div>
          <UserGiftCardsTabNav />
        </div>
      </div>
    </header>
  );
}

function UserGiftCardsPageHeroFallback({ title }: { title: string }) {
  const t = useTranslations("userPages.giftCards.tabs");
  const headerRef = useAdminStickyHeaderOffset(true);

  return (
    <header
      ref={headerRef}
      className="sticky z-20 -mx-4 mb-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      style={{ top: "var(--ommm-marketing-site-header-offset, 4.25rem)" }}
    >
      <div className="ommm-admin-header-bar flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-3">
          <h1 className="ommm-admin-header-title">{title}</h1>
          <nav
            role="tablist"
            aria-label={t("aria")}
            className="flex min-w-0 shrink-0 items-center gap-2 overflow-x-auto pb-1"
          >
            <span className="ommm-admin-pill-tab ommm-admin-pill-tab-active shrink-0 px-4 normal-case tracking-normal">
              {t("my")}
            </span>
            <span className="ommm-admin-pill-tab shrink-0 px-4 normal-case tracking-normal">
              {t("shop")}
            </span>
          </nav>
        </div>
      </div>
    </header>
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
