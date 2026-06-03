"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import {
  displayGiftCardDate,
  giftCardStatusBadgeClass,
  isGiftCardDateExpired,
} from "@/components/gift-cards/gift-card-display-helpers";
import type { UserGiftCardRow } from "@/components/account/user-gift-cards-types";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";
import { OmmModalPortal } from "@/components/ui/omm-modal";
import { OmmButton } from "@/components/ui/omm-button";
import { formatAmdFromCents } from "@/lib/price-amd";

type UserGiftCardDetailsModalProps = {
  card: UserGiftCardRow | null;
  locale: string;
  onClose: () => void;
};

const MODAL_PANEL_CLASS =
  "mt-auto flex max-h-[min(92vh,840px)] w-full max-w-[min(720px,95vw)] flex-col overflow-hidden rounded-t-[28px] border border-white/60 bg-white/85 shadow-[0_30px_70px_-30px_rgba(45,40,35,0.45)] backdrop-blur-md sm:mt-0 sm:rounded-[28px]";

function recipientLabel(card: UserGiftCardRow): string {
  return card.recipientName?.trim() || card.recipientEmail?.trim() || "";
}

export function UserGiftCardDetailsModal({
  card,
  locale,
  onClose,
}: UserGiftCardDetailsModalProps) {
  const t = useTranslations("userPages.giftCards");
  const isOpen = card !== null;

  return (
    <OmmModalPortal
      isOpen={isOpen}
      onClose={onClose}
      backdropAriaLabel={t("modalBackdropClose")}
      overlayClassName="ommm-modal-overlay z-[80] items-center p-4 sm:p-6"
      panelClassName={MODAL_PANEL_CLASS}
    >
      {card === null ? null : (
        <UserGiftCardDetailsContent card={card} locale={locale} onClose={onClose} />
      )}
    </OmmModalPortal>
  );
}

function UserGiftCardDetailsContent({
  card,
  locale,
  onClose,
}: {
  card: UserGiftCardRow;
  locale: string;
  onClose: () => void;
}) {
  const t = useTranslations("userPages.giftCards");
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const amountLabel = formatAmdFromCents(card.amountCents, locale);
  const balanceLabel = formatAmdFromCents(card.balanceCents, locale);
  const expired = isGiftCardDateExpired(card.status, card.expiresAt);
  const recipient = recipientLabel(card);
  const canRedeem = card.status === "ACTIVE" && card.balanceCents > 0 && !expired;
  const resolvedImage = resolveApiAssetUrl(card.imageUrl);

  const onCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(card.code);
      setCopyFeedback(t("copyCodeSuccess"));
    } catch {
      setCopyFeedback(t("copyCodeFailed"));
    }
  }, [card.code, t]);

  return (
    <>
      <div className="flex items-start justify-between gap-4 border-b border-white/60 bg-white/55 px-5 py-4 sm:px-7 sm:py-5">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-sage-500">{t("detailsModalEyebrow")}</p>
          <h2 className="mt-1 font-serif text-xl font-semibold text-sage-900 sm:text-2xl">{amountLabel}</h2>
          <p className="ommm-body-muted mt-1 text-sm">
            {t("detailsModalLead", { balance: balanceLabel })}
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-full p-2 text-sage-500 transition-colors hover:bg-white/60 hover:text-sage-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          aria-label={t("modalCloseAria")}
          onClick={onClose}
        >
          <CloseGlyph />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
        <section className="overflow-hidden rounded-[24px] border border-white/60 bg-white/75 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.18)]">
          <div className="flex w-full items-center justify-center bg-sage-100 p-4">
            {resolvedImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- supports API and blob/image URLs
              <img
                src={resolvedImage}
                alt={t("cardImageAlt")}
                className="h-auto max-h-[min(55vh,420px)] w-full object-contain"
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

        <section className="rounded-[24px] border border-white/60 bg-white/75 p-4 sm:p-5">
          <p className="font-medium text-sage-900">{t("detailsModalInfoHeading")}</p>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <DetailField label={t("cardCreated")} value={displayGiftCardDate(card.createdAt)} />
            <DetailField
              label={t("cardExpiration")}
              value={
                card.expiresAt !== null
                  ? displayGiftCardDate(card.expiresAt)
                  : t("cardNoExpiration")
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

        <section className="rounded-[24px] border border-white/60 bg-white/75 p-4 sm:p-5">
          <p className="font-medium text-sage-900">{t("detailsModalActionsHeading")}</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <OmmButton type="button" variant="secondary" size="sm" onClick={() => void onCopyCode()}>
              {t("copyCode")}
            </OmmButton>
          </div>
          {copyFeedback ? <p className="mt-2 text-sm text-sage-600">{copyFeedback}</p> : null}
          {canRedeem ? (
            <p className="ommm-body-muted mt-3 text-sm">{t("redeemHint")}</p>
          ) : null}
        </section>
      </div>
    </>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/60 bg-white/75 p-4 shadow-[0_12px_28px_-20px_rgba(45,40,35,0.16)]">
      <p className="text-xs uppercase tracking-wide text-sage-500">{label}</p>
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
      <dt className="text-xs uppercase tracking-wide text-sage-500">{label}</dt>
      <dd className="mt-1 break-words font-medium text-sage-800">{value}</dd>
    </div>
  );
}

function CloseGlyph() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      className="h-5 w-5"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
