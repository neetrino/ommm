"use client";

import { useCallback, useId, useState } from "react";
import { useTranslations } from "next-intl";
import {
  GiftRecipientPicker,
  formatRecipientLabel,
  type GiftRecipientOption,
} from "@/components/account/gift-recipient-picker";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS,
  ADMIN_DETAILS_SHEET_FOOTER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
  ADMIN_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { displayGiftCardDate, giftCardStatusBadgeClass } from "@/components/gift-cards/gift-card-display-helpers";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { formatAmdFromCents } from "@/lib/price-amd";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";

export type GiftMarketCardPreview = {
  id: string;
  amountCents: number;
  imageUrl: string | null;
  availableQuantity: number;
  totalQuantity: number;
  expiresAt: string | null;
  status: string;
};

export type GiftPurchaseIntent = {
  card: GiftMarketCardPreview;
  recipient: GiftRecipientOption;
};

type GiftMarketCardDetailsSheetProps = {
  card: GiftMarketCardPreview | null;
  locale: string;
  busy: boolean;
  onClose: () => void;
  onBuy: (intent: GiftPurchaseIntent) => void;
};

/** Details drawer for a shop gift card before gifting to another member. */
export function GiftMarketCardDetailsSheet({
  card,
  locale,
  busy,
  onClose,
  onBuy,
}: GiftMarketCardDetailsSheetProps) {
  if (card === null) {
    return null;
  }

  return (
    <GiftMarketCardDetailsSheetInner
      key={card.id}
      card={card}
      locale={locale}
      busy={busy}
      onClose={onClose}
      onBuy={onBuy}
    />
  );
}

function GiftMarketCardDetailsSheetInner({
  card,
  locale,
  busy,
  onClose,
  onBuy,
}: {
  card: GiftMarketCardPreview;
  locale: string;
  busy: boolean;
  onClose: () => void;
  onBuy: (intent: GiftPurchaseIntent) => void;
}) {
  const t = useTranslations("userPages.giftCards");
  const tPurchase = useTranslations("userPages.giftCards.purchaseForm");
  const titleId = useId();
  const amountLabel = formatAmdFromCents(card.amountCents, locale);
  const resolvedImage = resolveApiAssetUrl(card.imageUrl);
  const [recipient, setRecipient] = useState<GiftRecipientOption | null>(null);
  const [recipientError, setRecipientError] = useState<string | null>(null);

  const canBuy = !busy && card.availableQuantity > 0 && recipient !== null;

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  function handleBuy() {
    if (recipient === null) {
      setRecipientError(tPurchase("recipientRequired"));
      return;
    }
    setRecipientError(null);
    onBuy({ card, recipient });
  }

  return (
    <OmmDrawerPortal
      isOpen
      onClose={handleClose}
      backdropAriaLabel={tPurchase("sheetBackdropClose")}
      ariaLabelledBy={titleId}
      overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      panelClassName={ADMIN_WIDE_DRAWER_PANEL_CLASS}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <h2 id={titleId} className={`min-w-0 ${ADMIN_DETAILS_SHEET_TITLE_CLASS}`}>
          {amountLabel}
        </h2>
      </header>

      <div className={`${ADMIN_DETAILS_SHEET_BODY_CLASS} min-h-0 flex-1 space-y-4`}>
        <section className="overflow-hidden rounded-[24px] border border-white/60 bg-white/75 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.18)]">
          <div className="flex w-full items-center justify-center bg-sage-100 p-4">
            {resolvedImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- market cards may use CDN or API URLs
              <img
                src={resolvedImage}
                alt={tPurchase("selectedImageAlt")}
                className="h-auto max-h-[min(40vh,320px)] w-full object-contain"
              />
            ) : (
              <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-sand-100 via-paper to-mint-100 sm:h-48">
                <span className="text-sm font-medium text-sage-600">{tPurchase("noImage")}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-white/60 px-4 py-3">
            <span className={giftCardStatusBadgeClass(card.status)}>
              {t(`statusValues.${card.status}`)}
            </span>
          </div>
        </section>

        <p className="ommm-body-muted text-sm">{tPurchase("detailsLead")}</p>

        <section className="rounded-[24px] border border-white/60 bg-white/75 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.18)] sm:p-5">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <DetailField label={t("cardAmount")} value={amountLabel} />
            <DetailField
              label={tPurchase("availableLabel")}
              value={`${card.availableQuantity} / ${card.totalQuantity}`}
            />
            <DetailField
              label={t("cardExpiration")}
              value={
                card.expiresAt !== null
                  ? displayGiftCardDate(card.expiresAt)
                  : t("cardNoExpiration")
              }
              className="sm:col-span-2"
            />
          </dl>
        </section>

        <GiftRecipientPicker
          selected={recipient}
          onSelect={(value) => {
            setRecipient(value);
            setRecipientError(null);
          }}
          disabled={busy}
        />

        {recipient !== null ? (
          <p className="text-sm text-sage-700">
            {tPurchase("recipientSelectedSummary", {
              name: formatRecipientLabel(recipient),
            })}
          </p>
        ) : null}

        {recipientError !== null ? (
          <p className="text-sm text-red-800" role="alert">
            {recipientError}
          </p>
        ) : null}
      </div>

      <footer
        className={`${ADMIN_DETAILS_SHEET_FOOTER_CLASS} flex flex-col gap-3 sm:flex-row sm:justify-end`}
      >
        <OmmButton type="button" variant="secondary" disabled={busy} onClick={handleClose}>
          {tPurchase("closeDetails")}
        </OmmButton>
        <OmmButton type="button" variant="primary" disabled={!canBuy} onClick={handleBuy}>
          {tPurchase("buyAsGift")}
        </OmmButton>
      </footer>
    </OmmDrawerPortal>
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
      <dd className="mt-1 font-medium text-sage-900">{value}</dd>
    </div>
  );
}
