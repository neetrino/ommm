"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminGiftCardActions } from "@/components/admin/admin-gift-card-actions";
import {
  displayGiftCardDate,
  giftCardQuantityLabel,
  giftCardStatusBadgeClass,
} from "@/components/admin/admin-gift-card-display-helpers";
import {
  isGiftCardExpired,
  purchaserLabel,
  recipientLabel,
} from "@/components/admin/admin-gift-cards-filter-logic";
import type {
  AdminAssignableUser,
  AdminGiftCardBatchRow,
} from "@/components/admin/admin-gift-cards-types";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_LEDE_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
  ADMIN_WIDE_DRAWER_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { formatAmdFromCents } from "@/lib/price-amd";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";

type AdminGiftCardDetailsSheetProps = {
  card: AdminGiftCardBatchRow | null;
  locale: string;
  assignableUsers: readonly AdminAssignableUser[];
  onClose: () => void;
  onChanged: () => void;
};

export function AdminGiftCardDetailsSheet({
  card,
  locale,
  assignableUsers,
  onClose,
  onChanged,
}: AdminGiftCardDetailsSheetProps) {
  const t = useTranslations("adminPages.giftCards");
  const titleId = useId();
  const descId = useId();

  if (card === null) {
    return null;
  }

  return (
    <OmmDrawerPortal
      isOpen
      onClose={onClose}
      backdropAriaLabel={t("modalBackdropClose")}
      ariaLabelledBy={titleId}
      overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      panelClassName={ADMIN_WIDE_DRAWER_PANEL_CLASS}
    >
      <GiftCardDetailsContent
        card={card}
        locale={locale}
        assignableUsers={assignableUsers}
        titleId={titleId}
        descId={descId}
        onClose={onClose}
        onChanged={onChanged}
      />
    </OmmDrawerPortal>
  );
}

type GiftCardDetailsContentProps = {
  card: AdminGiftCardBatchRow;
  locale: string;
  assignableUsers: readonly AdminAssignableUser[];
  titleId: string;
  descId: string;
  onClose: () => void;
  onChanged: () => void;
};

function GiftCardDetailsContent({
  card,
  locale,
  assignableUsers,
  titleId,
  descId,
  onClose,
  onChanged,
}: GiftCardDetailsContentProps) {
  const t = useTranslations("adminPages.giftCards");
  const resolvedImage = resolveApiAssetUrl(card.imageUrl);
  const recipient = recipientLabel(card);
  const expired = isGiftCardExpired(card);
  const amountLabel = formatAmdFromCents(card.amountAmd, locale);

  return (
    <>
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-xs uppercase tracking-wide text-sage-500">
              {t("detailsModalEyebrow")}
            </p>
            <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
              {amountLabel}
            </h2>
            <p id={descId} className={ADMIN_DETAILS_SHEET_LEDE_CLASS}>
              {t("detailsModalLead", { available: giftCardQuantityLabel(card) })}
            </p>
          </div>
          <button
            type="button"
            className={ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS}
            aria-label={t("modalCloseAria")}
            onClick={onClose}
          >
            <CloseGlyph />
          </button>
        </div>
      </header>

      <div className={`${ADMIN_DETAILS_SHEET_BODY_CLASS} space-y-4`}>
        <section className="overflow-hidden rounded-[24px] border border-white/60 bg-white/75 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.18)]">
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
          <MetricCard label={t("colAmount")} value={amountLabel} />
          <MetricCard label={t("colAvailableQuantity")} value={giftCardQuantityLabel(card)} />
        </div>

        <section className="rounded-[24px] border border-white/60 bg-white/75 p-4 sm:p-5">
          <p className="font-medium text-sage-900">{t("detailsModalInfoHeading")}</p>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <DetailField label={t("colPurchaser")} value={purchaserLabel(card)} />
            <DetailField
              label={t("colRecipient")}
              value={recipient.length > 0 ? recipient : "—"}
            />
            <DetailField label={t("colCreated")} value={displayGiftCardDate(card.createdAt)} />
            <DetailField label={t("colExpiration")} value={displayGiftCardDate(card.expiresAt)} />
            {card.message ? (
              <DetailField label={t("fieldMessage")} value={card.message} className="sm:col-span-2" />
            ) : null}
          </dl>
        </section>

        <section className="rounded-[24px] border border-white/60 bg-white/75 p-4 sm:p-5">
          <p className="mb-4 font-medium text-sage-900">{t("colActions")}</p>
          <AdminGiftCardActions
            batchId={card.id}
            allowDeactivate={card.status === "ACTIVE"}
            allowDelete
            locale={locale}
            assignableUsers={assignableUsers}
            onChanged={onChanged}
          />
        </section>
      </div>
    </>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={adminChrome.metricCard}>
      <p className={adminChrome.metricLabel}>{label}</p>
      <p className={adminChrome.metricValue}>{value}</p>
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
