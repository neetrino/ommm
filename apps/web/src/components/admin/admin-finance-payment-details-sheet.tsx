"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import {
  AdminFinanceArcaSyncButton,
  arcaOutcomeToStatus,
  type ArcaSyncOutcome,
} from "@/components/admin/admin-finance-arca-sync-button";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_CLOSE_BUTTON_CLASS,
  ADMIN_DETAILS_SHEET_FOOTER_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_LEDE_CLASS,
  ADMIN_BOOKINGS_DETAILS_SHEET_PANEL_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import { AdminFinancePaymentDetailsBody } from "@/components/admin/admin-finance-payment-details-body";
import { AdminFinancePaymentEhdmPrinter } from "@/components/admin/admin-finance-payment-ehdm-printer";
import type { FinancePaymentItem } from "@/components/admin/admin-finance-types";
import { AdminCenterToast, type AdminCenterToastTone } from "@/components/ui/admin-center-toast";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { useAdminAnimatedSheetClose } from "@/components/admin/use-admin-animated-sheet-close";
import { isCardPaymentMethod } from "@/lib/payment-confirmation";

type AdminFinancePaymentDetailsSheetProps = {
  payment: FinancePaymentItem | null;
  locale: string;
  onClose: () => void;
  onPaymentUpdated: (payment: FinancePaymentItem) => void;
  /** Arca bank sync is Admin-only. */
  canSyncArca?: boolean;
  /** Cash/terminal paid date edits are Admin-only. */
  canEditPaidAt?: boolean;
};

type ToastState = { message: string; tone: AdminCenterToastTone } | null;

function displayName(payment: FinancePaymentItem): string {
  const merged = [payment.user.name, payment.user.lastName].filter(Boolean).join(" ").trim();
  return merged.length > 0 ? merged : payment.user.email;
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
  canSyncArca = true,
  canEditPaidAt = true,
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

  const userLabel = displayName(payment);
  const showArcaSync =
    canSyncArca &&
    isCardPaymentMethod(payment.paymentMethod) &&
    payment.status === "PENDING";

  return (
    <>
      <AdminSheetPortal presentation="drawer"
        isOpen={sheetOpen}
        onClose={requestClose}
        onAfterClose={onAfterClose}
        backdropAriaLabel={t("paymentDetails.closeBackdrop")}
        ariaLabelledBy={titleId}
        drawerOverlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
        drawerPanelClassName={ADMIN_BOOKINGS_DETAILS_SHEET_PANEL_CLASS}
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
          <AdminFinancePaymentDetailsBody
            payment={payment}
            locale={locale}
            userLabel={userLabel}
            canEditPaidAt={canEditPaidAt}
            onPaymentUpdated={onPaymentUpdated}
            onToast={(message, tone) => setToast({ message, tone })}
          />
          <AdminFinancePaymentEhdmPrinter payment={payment} locale={locale} />
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
