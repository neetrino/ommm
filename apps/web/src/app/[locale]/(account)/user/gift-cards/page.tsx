import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { GiftPurchaseForm } from "@/components/account/gift-purchase-form";
import { GiftRedeemForm } from "@/components/account/gift-redeem-form";
import { UserGiftCardsBoard } from "@/components/account/user-gift-cards-board";
import type { UserGiftCardRow } from "@/components/account/user-gift-cards-types";
import { AccountSection } from "@/components/layout/account-page-frame";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { formatAmdFromCents } from "@/lib/price-amd";
import { serverApiJson } from "@/lib/server-api";

export default async function UserGiftCardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "userPages.giftCards" });
  const cookie = (await headers()).get("cookie") ?? "";

  const [purchasedRes, receivedRes, meRes] = await Promise.all([
    serverApiJson<UserGiftCardRow[]>("/gift-cards/me/purchased", cookie),
    serverApiJson<UserGiftCardRow[]>("/gift-cards/me/received", cookie),
    serverApiJson<{ user: { giftCreditsCents: number } }>("/users/me", cookie),
  ]);

  const credits = meRes.ok ? meRes.data.user.giftCreditsCents : null;

  return (
    <MemberContentFrame
      description={
        credits != null
          ? t("giftBalance", { amount: formatAmdFromCents(credits, locale) })
          : undefined
      }
    >
      <div className="max-w-6xl space-y-10">
        <AccountSection title={t("redeem")}>
          <div className="max-w-sm">
            <GiftRedeemForm />
          </div>
        </AccountSection>

        <AccountSection title={t("purchase")}>
          <div className="mt-4">
            <GiftPurchaseForm />
          </div>
        </AccountSection>

        <UserGiftCardsBoard
          locale={locale}
          purchased={purchasedRes.ok ? purchasedRes.data : []}
          received={receivedRes.ok ? receivedRes.data : []}
          purchasedError={purchasedRes.ok ? null : purchasedRes.status}
          receivedError={receivedRes.ok ? null : receivedRes.status}
        />
      </div>
    </MemberContentFrame>
  );
}
