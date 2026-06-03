import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { GiftPurchaseForm } from "@/components/account/gift-purchase-form";
import { GiftRedeemForm } from "@/components/account/gift-redeem-form";
import { AccountSection } from "@/components/layout/account-page-frame";
import { MemberContentFrame } from "@/components/layout/member-content-frame";
import { formatDateForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";
import { serverApiJson } from "@/lib/server-api";

type GiftRow = {
  id: string;
  code: string;
  amountCents: number;
  balanceCents: number;
  status: string;
  imageUrl: string | null;
  recipientEmail: string | null;
  recipientName: string | null;
  expiresAt: string | null;
};

function statusTone(status: string): string {
  if (status === "ACTIVE") {
    return "border-mint-200 bg-mint-50 text-sage-800";
  }
  if (status === "REDEEMED") {
    return "border-sand-200 bg-sand-50 text-sage-800";
  }
  if (status === "DEACTIVATED") {
    return "border-red-200 bg-red-50 text-red-800";
  }
  return "border-sage-200 bg-sage-50 text-sage-700";
}

function GiftCardGrid({
  cards,
  locale,
  t,
}: {
  cards: GiftRow[];
  locale: string;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  return (
    <ul className="mt-4 grid gap-4 sm:grid-cols-2">
      {cards.map((card) => {
        const resolvedImage = resolveApiAssetUrl(card.imageUrl);
        return (
          <li
            key={card.id}
            className="overflow-hidden rounded-3xl border border-white/65 bg-white/80 shadow-[0_18px_40px_-24px_rgba(45,40,35,0.28)]"
          >
            <div className="relative aspect-[16/9] w-full bg-sage-100">
              {resolvedImage ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element -- accepts dynamic API URLs and R2 URLs */}
                  <img
                    src={resolvedImage}
                    alt={t("cardImageAlt")}
                    className="h-full w-full object-cover"
                  />
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sand-100 via-paper to-mint-100">
                  <span className="text-sm font-medium text-sage-600">{t("cardImageFallback")}</span>
                </div>
              )}
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-base font-semibold text-sage-900">
                  {formatAmdFromCents(card.amountCents, locale)}
                </p>
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${statusTone(card.status)}`}>
                  {card.status}
                </span>
              </div>
              <dl className="grid gap-1 text-sm text-sage-700">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-sage-500">{t("cardBalance")}</dt>
                  <dd>{formatAmdFromCents(card.balanceCents, locale)}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-sage-500">{t("cardExpiration")}</dt>
                  <dd>{card.expiresAt ? formatDateForUi(card.expiresAt) : t("cardNoExpiration")}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-sage-500">{t("cardCode")}</dt>
                  <dd className="font-mono text-xs">{card.code}</dd>
                </div>
              </dl>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default async function UserGiftCardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "userPages.giftCards" });
  const cookie = (await headers()).get("cookie") ?? "";

  const [purchasedRes, receivedRes, meRes] = await Promise.all([
    serverApiJson<GiftRow[]>("/gift-cards/me/purchased", cookie),
    serverApiJson<GiftRow[]>("/gift-cards/me/received", cookie),
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
            <GiftCardGrid cards={purchasedRes.data} locale={locale} t={t} />
          )}
        </section>

        <section>
          <h2 className="ommm-h3 text-sage-800">{t("receivedHeading")}</h2>
          {!receivedRes.ok ? (
            <p className="ommm-body-muted mt-2 text-sm">{t("signInToView")}</p>
          ) : receivedRes.data.length === 0 ? (
            <p className="ommm-body-muted mt-2 text-sm">{t("emptyReceived")}</p>
          ) : (
            <GiftCardGrid cards={receivedRes.data} locale={locale} t={t} />
          )}
        </section>
      </div>
    </MemberContentFrame>
  );
}
