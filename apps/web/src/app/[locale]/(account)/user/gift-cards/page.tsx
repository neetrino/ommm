import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { GiftPurchaseForm } from "@/components/account/gift-purchase-form";
import { GiftRedeemForm } from "@/components/account/gift-redeem-form";
import { UserGiftCardsBoard } from "@/components/account/user-gift-cards-board";
import { UserGiftCardsPageHero } from "@/components/account/user-gift-cards-page-hero";
import { UserGiftCardsSection } from "@/components/account/user-gift-card-tile-layout";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import type { UserGiftCardRow } from "@/components/account/user-gift-cards-types";
import { mergeUserGiftCards } from "@/lib/merge-user-gift-cards";
import { formatAmdFromCents } from "@/lib/price-amd";
import { parseUserGiftCardsTab } from "@/lib/user-gift-cards-tab";
import { serverApiJson } from "@/lib/server-api";

export default async function UserGiftCardsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const tab = parseUserGiftCardsTab(search);
  const t = await getTranslations({ locale, namespace: "userPages.giftCards" });
  const cookie = (await headers()).get("cookie") ?? "";

  const [purchasedRes, receivedRes, meRes] = await Promise.all([
    serverApiJson<UserGiftCardRow[]>("/gift-cards/me/purchased", cookie),
    serverApiJson<UserGiftCardRow[]>("/gift-cards/me/received", cookie),
    serverApiJson<{ user: { giftCreditsCents: number } }>("/users/me", cookie),
  ]);

  const credits = meRes.ok ? meRes.data.user.giftCreditsCents : null;
  const purchased = purchasedRes.ok ? purchasedRes.data : [];
  const received = receivedRes.ok ? receivedRes.data : [];
  const mergedCards = mergeUserGiftCards(purchased, received);
  const loadError = !purchasedRes.ok && !receivedRes.ok ? purchasedRes.status : null;

  const heroDescription =
    credits != null ? t("giftBalance", { amount: formatAmdFromCents(credits, locale) }) : undefined;

  return (
    <MemberContentFrame>
      <div className="space-y-4">
        <UserGiftCardsPageHero title={t("title")} description={heroDescription} />

        {tab === "my" ? (
          <div className="space-y-0">
            <UserGiftCardsSection title={t("redeem")}>
              <div className="max-w-sm">
                <GiftRedeemForm />
              </div>
            </UserGiftCardsSection>

            <Suspense fallback={null}>
              <UserGiftCardsBoard
                locale={locale}
                cards={mergedCards}
                loadError={loadError}
              />
            </Suspense>
          </div>
        ) : (
          <UserGiftCardsSection title={t("purchase")}>
            <GiftPurchaseForm locale={locale} />
          </UserGiftCardsSection>
        )}
      </div>
    </MemberContentFrame>
  );
}
