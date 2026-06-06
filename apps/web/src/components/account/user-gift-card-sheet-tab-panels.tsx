"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import type { UserGiftCardRow } from "@/components/account/user-gift-cards-types";
import {
  USER_GIFT_CARD_SHEET_TAB_ACTIONS,
  USER_GIFT_CARD_SHEET_TAB_OVERVIEW,
} from "@/components/account/user-gift-card-sheet-tabs";
import {
  displayGiftCardDate,
  giftCardStatusBadgeClass,
  isGiftCardDateExpired,
} from "@/components/gift-cards/gift-card-display-helpers";
import {
  ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { OmmButton } from "@/components/ui/omm-button";
import { formatAmdFromCents } from "@/lib/price-amd";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";

const SECTION_CLASS =
  "rounded-[24px] border border-white/60 bg-white/75 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.18)]";

type UserGiftCardSheetTabPanelsProps = {
  activeTab: string;
  card: UserGiftCardRow;
  locale: string;
};

export function UserGiftCardSheetTabPanels({
  activeTab,
  card,
  locale,
}: UserGiftCardSheetTabPanelsProps) {
  if (activeTab === USER_GIFT_CARD_SHEET_TAB_OVERVIEW) {
    return <UserGiftCardOverviewPanel card={card} locale={locale} />;
  }

  if (activeTab === USER_GIFT_CARD_SHEET_TAB_ACTIONS) {
    return <UserGiftCardActionsPanel card={card} />;
  }

  return null;
}

function UserGiftCardOverviewPanel({
  card,
  locale,
}: {
  card: UserGiftCardRow;
  locale: string;
}) {
  const t = useTranslations("userPages.giftCards");
  const resolvedImage = resolveApiAssetUrl(card.imageUrl);
  const amountLabel = formatAmdFromCents(card.amountCents, locale);
  const balanceLabel = formatAmdFromCents(card.balanceCents, locale);
  const expired = isGiftCardDateExpired(card.status, card.expiresAt);
  const recipient = card.recipientName?.trim() || card.recipientEmail?.trim() || "";

  return (
    <div className="space-y-4">
      <section className={`${SECTION_CLASS} overflow-hidden`}>
        <div className="flex w-full items-center justify-center bg-sage-100 p-4">
          {resolvedImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- supports API and blob/image URLs
            <img
              src={resolvedImage}
              alt={t("cardImageAlt")}
              className="h-auto max-h-[min(40vh,320px)] w-full object-contain"
            />
          ) : (
            <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-sand-100 via-paper to-mint-100 sm:h-48">
              <span className="text-sm font-medium text-sage-600">{t("cardImageFallback")}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-white/60 px-4 py-3">
          <span className={giftCardStatusBadgeClass(card.status)}>
            {t(`statusValues.${card.status}`)}
          </span>
          {card.expiresAt !== null ? (
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${
                expired
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-mint-200 bg-mint-50 text-sage-900"
              }`}
            >
              {expired ? t("drawerExpired") : t("drawerValid")}
            </span>
          ) : null}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <MetricCard label={t("cardAmount")} value={amountLabel} />
        <MetricCard label={t("cardBalance")} value={balanceLabel} />
      </div>

      <section className={`${SECTION_CLASS} p-4 sm:p-5`}>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <DetailField label={t("cardCreated")} value={displayGiftCardDate(card.createdAt)} />
          <DetailField
            label={t("cardExpiration")}
            value={
              card.expiresAt !== null ? displayGiftCardDate(card.expiresAt) : t("cardNoExpiration")
            }
          />
          {recipient.length > 0 ? (
            <DetailField label={t("cardRecipient")} value={recipient} />
          ) : null}
          {card.message ? (
            <DetailField label={t("cardMessage")} value={card.message} className="sm:col-span-2" />
          ) : null}
          <DetailField label={t("cardCode")} value={card.code} className="sm:col-span-2" />
        </dl>
      </section>
    </div>
  );
}

function UserGiftCardActionsPanel({ card }: { card: UserGiftCardRow }) {
  const t = useTranslations("userPages.giftCards");
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const expired = isGiftCardDateExpired(card.status, card.expiresAt);
  const canRedeem = card.status === "ACTIVE" && card.balanceCents > 0 && !expired;

  const onCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(card.code);
      setCopyFeedback(t("copyCodeSuccess"));
    } catch {
      setCopyFeedback(t("copyCodeFailed"));
    }
  }, [card.code, t]);

  return (
    <section className={`${SECTION_CLASS} p-4 sm:p-5`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <OmmButton type="button" variant="secondary" size="sm" onClick={() => void onCopyCode()}>
          {t("copyCode")}
        </OmmButton>
      </div>
      {copyFeedback ? <p className="mt-2 text-sm text-sage-600">{copyFeedback}</p> : null}
      {canRedeem ? (
        <p className="ommm-body-muted mt-3 text-sm">{t("redeemHint")}</p>
      ) : null}
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/60 bg-white/75 p-4 shadow-[0_12px_28px_-20px_rgba(45,40,35,0.16)]">
      <p className={ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS}>{label}</p>
      <p className="mt-1 text-lg font-semibold text-sage-900">{value}</p>
    </div>
  );
}

function DetailField({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className={ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS}>{label}</dt>
      <dd className={`mt-1 break-words ${ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS}`}>{value}</dd>
    </div>
  );
}
