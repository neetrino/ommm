import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { GiftPurchaseForm } from "@/components/account/gift-purchase-form";
import { GiftRedeemForm } from "@/components/account/gift-redeem-form";
import {
  AccountPageFrame,
  AccountSection,
} from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type GiftRow = {
  id: string;
  code: string;
  amountCents: number;
  balanceCents: number;
  status: string;
  recipientEmail: string | null;
  recipientName: string | null;
};

export default async function UserGiftCardsPage() {
  const t = await getTranslations("userPages.giftCards");
  const cookie = (await headers()).get("cookie") ?? "";

  const [purchasedRes, receivedRes, meRes] = await Promise.all([
    serverApiJson<GiftRow[]>("/gift-cards/me/purchased", cookie),
    serverApiJson<GiftRow[]>("/gift-cards/me/received", cookie),
    serverApiJson<{ user: { giftCreditsCents: number } }>("/users/me", cookie),
  ]);

  const credits = meRes.ok ? meRes.data.user.giftCreditsCents : null;

  return (
    <AccountPageFrame
      title={t("title")}
      description={
        credits != null ? t("giftBalance", { cents: credits }) : undefined
      }
    >
      <div className="max-w-4xl space-y-10">
        <AccountSection title={t("redeem")}>
          <div className="max-w-sm">
            <GiftRedeemForm />
          </div>
        </AccountSection>

        <AccountSection title={t("purchase")}>
          <p className="ommm-body-muted text-sm">
            {t("stripeNote", { code: "STRIPE_SECRET_KEY" })}
          </p>
          <div className="mt-4 max-w-sm">
            <GiftPurchaseForm />
          </div>
        </AccountSection>

        <section>
          <h2 className="ommm-h3 text-sage-800">{t("purchasedHeading")}</h2>
          {!purchasedRes.ok ? (
            <p className="ommm-body-muted mt-2 text-sm">{t("signInToView")}</p>
          ) : purchasedRes.data.length === 0 ? (
            <p className="ommm-body-muted mt-2 text-sm">{t("emptyPurchased")}</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {purchasedRes.data.map((g) => (
                <li key={g.id} className="ommm-inset-row font-mono text-sage-700">
                  {t("rowPurchased", {
                    code: g.code,
                    balance: g.balanceCents,
                    amount: g.amountCents,
                    status: g.status,
                  })}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="ommm-h3 text-sage-800">{t("receivedHeading")}</h2>
          {!receivedRes.ok ? (
            <p className="ommm-body-muted mt-2 text-sm">{t("signInToView")}</p>
          ) : receivedRes.data.length === 0 ? (
            <p className="ommm-body-muted mt-2 text-sm">{t("emptyReceived")}</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {receivedRes.data.map((g) => (
                <li key={g.id} className="ommm-inset-row">
                  {t("rowReceived", {
                    name: g.recipientName ?? t("giftFallbackName"),
                    balance: g.balanceCents,
                    status: g.status,
                  })}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AccountPageFrame>
  );
}
