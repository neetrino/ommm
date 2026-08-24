"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { SessionDateTimeHighlight } from "@/components/account/session-datetime-highlight";
import {
  formatPaymentTime,
  toPaymentIso,
} from "@/components/account/user-payment-display";
import {
  AdminFinanceArcaSyncButton,
  arcaOutcomeToStatus,
  type ArcaSyncOutcome,
} from "@/components/admin/admin-finance-arca-sync-button";
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
  ADMIN_DETAILS_SHEET_FOOTER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_LEDE_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_PANEL_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import {
  AdminFinancePaymentDetailRow,
  AdminFinancePaymentEhdmRows,
  AdminFinancePaymentPackageRows,
} from "@/components/admin/admin-finance-payment-details-rows";
import type { FinancePaymentItem } from "@/components/admin/admin-finance-types";
import { AdminCenterToast, type AdminCenterToastTone } from "@/components/ui/admin-center-toast";
import { AmdMoneyText } from "@/components/ui/amd-money-text";
import { OmmDrawerPortal } from "@/components/ui/omm-modal";
import { isManualPaymentMethod } from "@/lib/manual-payment-method";
import {
  isCardPaymentMethod,
  requiresManualAdminConfirmation,
} from "@/lib/payment-confirmation";
import { PaymentStatusReasonText } from "@/components/shared/payment-status-reason-text";

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

function resolvePaymentDateTime(payment: FinancePaymentItem): string {
  return payment.confirmedAt ?? payment.createdAt;
}

function arcaOutcomeToast(
  t: ReturnType<typeof useTranslations<"adminPages.finance">>,
  outcome: ArcaSyncOutcome,
): { message: string; tone: AdminCenterToastTone } {
  if (outcome === "deposited") {
    return { message: t("paymentActions.bankConfirmed"), tone: "ok" };
  }
  if (outcome === "failed") {
    return { message: t("paymentActions.bankFailed"), tone: "err" };
  }
  if (outcome === "in_progress") {
    return { message: t("paymentActions.bankPending"), tone: "ok" };
  }
  return { message: t("paymentActions.bankUnavailable"), tone: "err" };
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

  const paymentDateTime = resolvePaymentDateTime(payment);
  const paymentDateTimeIso = toPaymentIso(paymentDateTime);
  const userLabel = displayName(payment);
  const showAdminActions = requiresManualAdminConfirmation(
    payment.paymentMethod,
    payment.status,
  );
  const showArcaSync =
    isCardPaymentMethod(payment.paymentMethod) && payment.status === "PENDING";

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
            <AdminFinancePaymentDetailRow label={t("paymentDetails.customer")} value={userLabel} />
            <AdminFinancePaymentDetailRow label={t("paymentDetails.email")} value={payment.user.email} />
            <AdminFinancePaymentDetailRow
              label={t("table.colAmount")}
              value={
                <AmdMoneyText cents={payment.amountCents} locale={locale} className="font-serif text-lg" />
              }
            />
            <AdminFinancePaymentDetailRow
              label={t("table.colSource")}
              value={
                <span className={`${ADMIN_FINANCE_VALUE_BADGE_CLASS} ${financeSourceTone(payment.source)}`}>
                  {t(`sources.${payment.source}`)}
                </span>
              }
            />
            <AdminFinancePaymentDetailRow
              label={t("table.colPaymentMethod")}
              value={resolveMethodLabel(t, payment.paymentMethod)}
            />
            <AdminFinancePaymentDetailRow
              label={t("table.colStatus")}
              value={
                <div className="flex flex-col items-start gap-1">
                  <span
                    className={`${ADMIN_FINANCE_VALUE_BADGE_CLASS} ${financePaymentStatusTone(payment.status)}`}
                  >
                    {paymentStatusLabel(t, payment.status)}
                  </span>
                  <PaymentStatusReasonText
                    status={payment.status}
                    reason={payment.statusReason}
                    className="text-xs font-medium leading-snug text-sage-500"
                  />
                </div>
              }
            />
            <AdminFinancePaymentPackageRows payment={payment} t={t} />
            <AdminFinancePaymentDetailRow
              label={t("paymentDetails.dateTime")}
              value={
                <span className="inline-flex flex-wrap items-center gap-2">
                  <SessionDateTimeHighlight
                    locale={locale}
                    startsAt={paymentDateTimeIso}
                    endsAt={paymentDateTimeIso}
                    variant="listDateYear"
                  />
                  <span className="text-sm text-sage-700">
                    {formatPaymentTime(paymentDateTime, locale)}
                  </span>
                </span>
              }
            />
            <AdminFinancePaymentEhdmRows payment={payment} t={t} />
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
        ) : showArcaSync ? (
          <footer className={ADMIN_DETAILS_SHEET_FOOTER_CLASS}>
            <AdminFinanceArcaSyncButton
              paymentId={payment.id}
              status={payment.status}
              paymentMethod={payment.paymentMethod}
              onSynced={(outcome) => {
                const nextStatus = arcaOutcomeToStatus(outcome, payment.status);
                if (nextStatus !== payment.status) {
                  onPaymentUpdated({
                    ...payment,
                    status: nextStatus,
                    confirmedAt: payment.confirmedAt ?? new Date().toISOString(),
                  });
                }
                setToast(arcaOutcomeToast(t, outcome));
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

function CloseGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
