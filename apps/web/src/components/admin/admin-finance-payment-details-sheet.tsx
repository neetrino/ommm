"use client";

import { useId, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import {
  formatPaymentTime,
  toPaymentIso,
} from "@/components/account/user-payment-display";
import { AdminFinancePaymentActions } from "@/components/admin/admin-finance-payment-actions";
import {
  ADMIN_FINANCE_VALUE_BADGE_CLASS,
  financePaymentStatusTone,
  financeSourceTone,
} from "@/components/admin/admin-finance-list-display";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_BLOCK_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS,
  ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS,
  ADMIN_DETAILS_SHEET_FOOTER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_LEDE_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_PANEL_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import type { FinancePaymentItem } from "@/components/admin/admin-finance-types";
import { AdminCenterToast, type AdminCenterToastTone } from "@/components/ui/admin-center-toast";
import { AmdMoneyText } from "@/components/ui/amd-money-text";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { formatDateForUi, formatDateTimeForUi } from "@/lib/date-display";
import { isManualPaymentMethod } from "@/lib/manual-payment-method";
import { requiresManualAdminConfirmation } from "@/lib/payment-confirmation";

type AdminFinancePaymentDetailsSheetProps = {
  payment: FinancePaymentItem | null;
  locale: string;
  onClose: () => void;
  onPaymentUpdated: (payment: FinancePaymentItem) => void;
};

type ToastState = { message: string; tone: AdminCenterToastTone } | null;

function displayName(payment: FinancePaymentItem): string {
  const merged = [payment.user.name, payment.user.lastName].filter(Boolean).join(" ").trim();
  return merged.length > 0 ? merged : payment.user.email;
}

function paymentStatusLabel(
  t: ReturnType<typeof useTranslations<"adminPages.finance">>,
  status: string,
): string {
  if (status === "SUCCEEDED") return t("filters.statusSucceeded");
  if (status === "PENDING") return t("filters.statusPending");
  if (status === "FAILED") return t("filters.statusFailed");
  if (status === "REFUNDED") return t("filters.statusRefunded");
  return status;
}

function resolveMethodLabel(
  t: ReturnType<typeof useTranslations<"adminPages.finance">>,
  paymentMethod: string | null,
): string {
  if (paymentMethod === null || !isManualPaymentMethod(paymentMethod)) {
    return t("paymentDetails.methodUnknown");
  }
  return t(`paymentMethods.${paymentMethod}`);
}

function resolveRelatedLabel(
  t: ReturnType<typeof useTranslations<"adminPages.finance">>,
  payment: FinancePaymentItem,
): string {
  if (payment.description?.trim()) {
    return payment.description;
  }
  if (payment.sourceId) {
    return t(`paymentDetails.related.${payment.source}`, { id: payment.sourceId });
  }
  return "—";
}

export function AdminFinancePaymentDetailsSheet({
  payment,
  locale,
  onClose,
  onPaymentUpdated,
}: AdminFinancePaymentDetailsSheetProps) {
  const t = useTranslations("adminPages.finance");
  const titleId = useId();
  const [toast, setToast] = useState<ToastState>(null);

  if (payment === null) {
    return null;
  }

  const createdIso = toPaymentIso(payment.createdAt);
  const userLabel = displayName(payment);
  const showAdminActions = requiresManualAdminConfirmation(
    payment.paymentMethod,
    payment.status,
  );

  return (
    <>
      <OmmDrawerPortal
        isOpen
        onClose={onClose}
        backdropAriaLabel={t("paymentDetails.closeBackdrop")}
        ariaLabelledBy={titleId}
        overlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
        panelClassName={ADMIN_DETAILS_SHEET_PANEL_CLASS}
      >
        <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
                {t("paymentDetails.title")}
              </h2>
              <p className={ADMIN_DETAILS_SHEET_LEDE_CLASS}>{t("paymentDetails.lead")}</p>
              <p className="truncate text-sm font-medium text-sage-800">{userLabel}</p>
            </div>
            <button
              type="button"
              className={ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS}
              aria-label={t("paymentDetails.close")}
              onClick={onClose}
            >
              <CloseGlyph />
            </button>
          </div>
        </header>

        <div className={ADMIN_DETAILS_SHEET_BODY_CLASS}>
          <dl className={ADMIN_DETAILS_SHEET_DETAIL_BLOCK_CLASS}>
            <DetailRow label={t("paymentDetails.customer")} value={userLabel} />
            <DetailRow label={t("paymentDetails.email")} value={payment.user.email} />
            <DetailRow
              label={t("table.colAmount")}
              value={
                <AmdMoneyText cents={payment.amountCents} locale={locale} className="font-serif text-lg" />
              }
            />
            <DetailRow
              label={t("table.colSource")}
              value={
                <span className={`${ADMIN_FINANCE_VALUE_BADGE_CLASS} ${financeSourceTone(payment.source)}`}>
                  {t(`sources.${payment.source}`)}
                </span>
              }
            />
            <DetailRow
              label={t("table.colPaymentMethod")}
              value={resolveMethodLabel(t, payment.paymentMethod)}
            />
            <DetailRow
              label={t("table.colStatus")}
              value={
                <span
                  className={`${ADMIN_FINANCE_VALUE_BADGE_CLASS} ${financePaymentStatusTone(payment.status)}`}
                >
                  {paymentStatusLabel(t, payment.status)}
                </span>
              }
            />
            <DetailRow
              label={t("paymentDetails.relatedLabel")}
              value={resolveRelatedLabel(t, payment)}
            />
            {payment.paymentReference ? (
              <DetailRow label={t("paymentDetails.reference")} value={payment.paymentReference} />
            ) : null}
            <DetailRow
              label={t("paymentDetails.createdAt")}
              value={
                <span className="inline-flex flex-wrap items-center gap-2">
                  <SessionDateTimeHighlight
                    locale={locale}
                    startsAt={createdIso}
                    endsAt={createdIso}
                    variant="listDateYear"
                  />
                  <span className="text-sm text-sage-700">
                    {formatPaymentTime(payment.createdAt, locale)}
                  </span>
                </span>
              }
            />
            {payment.confirmedAt ? (
              <DetailRow
                label={t("paymentDetails.confirmedAt")}
                value={formatDateTimeForUi(payment.confirmedAt, locale)}
              />
            ) : null}
            {payment.confirmedAt ? (
              <DetailRow
                label={t("paymentDetails.confirmedDate")}
                value={formatDateForUi(payment.confirmedAt)}
              />
            ) : null}
          </dl>
        </div>

        {showAdminActions ? (
          <footer className={ADMIN_DETAILS_SHEET_FOOTER_CLASS}>
            <AdminFinancePaymentActions
              paymentId={payment.id}
              status={payment.status}
              paymentMethod={payment.paymentMethod}
              onUpdated={(nextStatus) => {
                onPaymentUpdated({
                  ...payment,
                  status: nextStatus,
                  paymentMethod: payment.paymentMethod ?? "CASH",
                  confirmedAt: new Date().toISOString(),
                });
                setToast({
                  message:
                    nextStatus === "SUCCEEDED"
                      ? t("paymentActions.markedPaid")
                      : t("paymentActions.markedRejected"),
                  tone: nextStatus === "SUCCEEDED" ? "ok" : "err",
                });
              }}
            />
          </footer>
        ) : null}
      </OmmDrawerPortal>

      <AdminCenterToast
        message={toast?.message ?? null}
        tone={toast?.tone}
        onDismiss={() => setToast(null)}
      />
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className={ADMIN_DETAILS_SHEET_DETAIL_LABEL_CLASS}>{label}</dt>
      <dd className={ADMIN_DETAILS_SHEET_DETAIL_VALUE_CLASS}>{value}</dd>
    </div>
  );
}

function CloseGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
