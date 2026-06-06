import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { GiftPurchaseForm } from "@/components/account/gift-purchase-form";
import { GiftRedeemForm } from "@/components/account/gift-redeem-form";
import { UserGiftCardsBoard } from "@/components/account/user-gift-cards-board";
import { UserGiftCardsSection } from "@/components/account/user-gift-card-tile-layout";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { formatAmdFromCents } from "@/lib/price-amd";
import {
  buildUserGiftCardsPurchasedEndpoint,
  buildUserGiftCardsReceivedEndpoint,
  parseUserGiftCardsPurchasedPageParams,
  parseUserGiftCardsReceivedPageParams,
  type UserGiftCardsSectionPayload,
} from "@/lib/user-gift-cards-query";
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
  const t = await getTranslations({ locale, namespace: "userPages.giftCards" });
  const cookie = (await headers()).get("cookie") ?? "";
  const purchasedPage = parseUserGiftCardsPurchasedPageParams(search);
  const receivedPage = parseUserGiftCardsReceivedPageParams(search);

  const [purchasedRes, receivedRes, meRes] = await Promise.all([
    serverApiJson<UserGiftCardsSectionPayload>(
      buildUserGiftCardsPurchasedEndpoint(purchasedPage.take, purchasedPage.offset),
      cookie,
    ),
    serverApiJson<UserGiftCardsSectionPayload>(
      buildUserGiftCardsReceivedEndpoint(receivedPage.take, receivedPage.offset),
      cookie,
    ),
    serverApiJson<{ user: { giftCreditsCents: number } }>("/users/me", cookie),
  ]);

  const credits = meRes.ok ? meRes.data.user.giftCreditsCents : null;
  const initialPurchased = purchasedRes.ok
    ? purchasedRes.data
    : { items: [], total: 0, take: purchasedPage.take, offset: purchasedPage.offset };
  const initialReceived = receivedRes.ok
    ? receivedRes.data
    : { items: [], total: 0, take: receivedPage.take, offset: receivedPage.offset };

  const heroDescription =
    credits != null ? t("giftBalance", { amount: formatAmdFromCents(credits, locale) }) : undefined;

  return (
    <MemberContentFrame>
      <div className="space-y-4">
        <AdminPageHero title={t("title")} description={heroDescription} />
      <div className="space-y-0">
        <UserGiftCardsSection title={t("redeem")}>
          <div className="max-w-sm">
            <GiftRedeemForm />
          </div>
        </UserGiftCardsSection>

        <UserGiftCardsSection title={t("purchase")}>
          <GiftPurchaseForm locale={locale} />
        </UserGiftCardsSection>

        <Suspense fallback={null}>
          <UserGiftCardsBoard
            locale={locale}
            initialPurchased={initialPurchased}
            initialReceived={initialReceived}
            purchasedError={purchasedRes.ok ? null : purchasedRes.status}
            receivedError={receivedRes.ok ? null : receivedRes.status}
          />
        </Suspense>
      </div>
      </div>
    </MemberContentFrame>
  );
}
