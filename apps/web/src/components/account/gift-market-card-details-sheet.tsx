"use client";

import { useCallback, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { GiftRecipientEmailField } from "@/components/account/gift-recipient-picker";
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
import { GiftCardFace } from "@/components/gift-cards/gift-card-face";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { isGiftRecipientEmail } from "@/lib/gift-recipient-email";
import { formatAmdFromCents } from "@/lib/price-amd";

export type GiftMarketCardPreview = {
  id: string;
  amountCents: number;
  imageUrl: string | null;
  availableQuantity: number;
  totalQuantity: number;
  expiresAt: string | null;
  status: string;
  type?: "FIXED_VALUE" | "FIXED_CLASS";
  classTypeId?: string | null;
  classTypeName?: string | null;
  classQuantity?: number;
};

type ClassGiftCopy = {
  (key: "classGiftValue", values: { className: string; count: number }): string;
  (key: "classGiftValueUnknown", values: { count: number }): string;
};

/** Money cards show AMD. Class cards show the class and how many sessions are on the card. */
export function marketGiftValueLabel(
  card: GiftMarketCardPreview,
  locale: string,
  t: ClassGiftCopy,
): string {
  if (card.type !== "FIXED_CLASS") {
    return formatAmdFromCents(card.amountCents, locale);
  }
  const count = card.classQuantity ?? 0;
  const className = card.classTypeName?.trim() ?? "";
  if (className.length === 0) {
    return t("classGiftValueUnknown", { count });
  }
  return t("classGiftValue", { className, count });
}

export type GiftPurchaseIntent = {
  card: GiftMarketCardPreview;
  recipientEmail: string;
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
  const amountLabel = marketGiftValueLabel(card, locale, t);
  const amountFieldLabel = card.type === "FIXED_CLASS" ? t("cartClassType") : t("cardAmount");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientError, setRecipientError] = useState<string | null>(null);

  const canBuy = !busy && card.availableQuantity > 0 && isGiftRecipientEmail(recipientEmail);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  function handleBuy() {
    const email = recipientEmail.trim();
    if (!isGiftRecipientEmail(email)) {
      setRecipientError(tPurchase("recipientRequired"));
      return;
    }
    setRecipientError(null);
    onBuy({ card, recipientEmail: email });
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
          <GiftCardFace alt={tPurchase("selectedImageAlt")} className="aspect-[1.58/1] w-full" />
          <div className="flex flex-wrap items-center gap-2 border-t border-white/60 px-4 py-3">
            <span className={giftCardStatusBadgeClass(card.status)}>
              {t(`statusValues.${card.status}`)}
            </span>
          </div>
        </section>

        <p className="ommm-body-muted text-sm">{tPurchase("detailsLead")}</p>

        <section className="rounded-[24px] border border-white/60 bg-white/75 p-4 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.18)] sm:p-5">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <DetailField label={amountFieldLabel} value={amountLabel} />
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

        <GiftRecipientEmailField
          value={recipientEmail}
          disabled={busy}
          validationMessage={recipientError}
          onChange={(value) => {
            setRecipientEmail(value);
            setRecipientError(null);
          }}
        />
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
