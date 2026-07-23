import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { GiftPurchaseForm } from "@/components/account/gift-purchase-form";
import { GiftRedeemForm } from "@/components/account/gift-redeem-form";
import { UserGiftCardsBoard } from "@/components/account/user-gift-cards-board";
import { UserGiftCardsPageHero } from "@/components/account/user-gift-cards-page-hero";
import { UserGiftCardsSection } from "@/components/account/user-gift-card-tile-layout";
import type { UserGiftCardRow } from "@/components/account/user-gift-cards-types";
import { mergeUserGiftCards } from "@/lib/merge-user-gift-cards";
import { parseUserGiftCardsTab } from "@/lib/user-gift-cards-tab";
import { serverApiJson } from "@/lib/server-api";
import { getCachedUsersMe } from "@/server/cached-users-me";

type MemberUserGiftCardsRouteContentProps = {
  locale: string;
  search: Record<string, string | undefined>;
  embeddedInSheet?: boolean;
};

export async function MemberUserGiftCardsRouteContent({
  locale,
  search,
  embeddedInSheet = false,
}: MemberUserGiftCardsRouteContentProps) {
  const tab = parseUserGiftCardsTab(search);
  const t = await getTranslations({ locale, namespace: "userPages.giftCards" });
  const cookie = (await headers()).get("cookie") ?? "";

  const [purchasedRes, receivedRes, meRes] = await Promise.all([
    serverApiJson<UserGiftCardRow[]>("/gift-cards/me/purchased", cookie),
    serverApiJson<UserGiftCardRow[]>("/gift-cards/me/received", cookie),
    getCachedUsersMe(),
  ]);

  const credits = meRes.ok ? meRes.data.user.giftCreditsCents ?? null : null;
  const purchased = purchasedRes.ok ? purchasedRes.data : [];
  const received = receivedRes.ok ? receivedRes.data : [];
  const mergedCards = mergeUserGiftCards(purchased, received);
  const loadError = !purchasedRes.ok && !receivedRes.ok ? purchasedRes.status : null;

  const pageHero = (
    <UserGiftCardsPageHero
      title={t("title")}
      locale={locale}
      giftBalanceCents={credits}
      embeddedInSheet={embeddedInSheet}
    />
  );

  const tabBody =
    tab === "my" ? (
      <div className="space-y-0">
        <UserGiftCardsSection title={t("redeem")}>
          <div className="max-w-sm">
            <GiftRedeemForm />
          </div>
        </UserGiftCardsSection>

        <UserGiftCardsBoard locale={locale} cards={mergedCards} loadError={loadError} />
      </div>
    ) : (
      <UserGiftCardsSection title={t("purchase")}>
        <GiftPurchaseForm locale={locale} />
      </UserGiftCardsSection>
    );

  return (
    <div className="space-y-4">
      {pageHero}
      {tabBody}
    </div>
  );
}
