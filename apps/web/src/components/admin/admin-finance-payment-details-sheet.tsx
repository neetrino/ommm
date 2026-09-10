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
import { AdminStaffPaymentEditors } from "@/components/admin/admin-staff-payment-editors";
import {
  ADMIN_FINANCE_VALUE_BADGE_CLASS,
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
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { useAdminAnimatedSheetClose } from "@/components/admin/use-admin-animated-sheet-close";
import { isCardPaymentMethod } from "@/lib/payment-confirmation";

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
  const { isOpen: sheetOpen, requestClose, onAfterClose } = useAdminAnimatedSheetClose(onClose, {
    openKey: payment?.id ?? null,
  });
  const [toast, setToast] = useState<ToastState>(null);

  if (payment === null) {
    return null;
  }

  const paymentDateTime = resolvePaymentDateTime(payment);
  const paymentDateTimeIso = toPaymentIso(paymentDateTime);
  const userLabel = displayName(payment);
  const showArcaSync =
    isCardPaymentMethod(payment.paymentMethod) && payment.status === "PENDING";

  return (
    <>
      <AdminSheetPortal presentation="drawer"
        isOpen={sheetOpen}
        onClose={requestClose}
        onAfterClose={onAfterClose}
        backdropAriaLabel={t("paymentDetails.closeBackdrop")}
        ariaLabelledBy={titleId}
        drawerOverlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
        drawerPanelClassName={ADMIN_DETAILS_SHEET_PANEL_CLASS}
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
              onClick={requestClose}
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
              label={t("table.colStatus")}
              value={
                <AdminStaffPaymentEditors
                  paymentId={payment.id}
                  status={payment.status}
                  paymentMethod={payment.paymentMethod}
                  statusReason={payment.statusReason}
                  onUpdated={(next) => {
                    onPaymentUpdated({
                      ...payment,
                      status: next.status,
                      paymentMethod: next.paymentMethod,
                      confirmedAt:
                        next.status === "PENDING"
                          ? null
                          : (payment.confirmedAt ?? new Date().toISOString()),
                    });
                  }}
                  onError={(message) => {
                    setToast({ message, tone: "err" });
                  }}
                />
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

        {showArcaSync ? (
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
      </AdminSheetPortal>

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
