"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AdminFinancePaymentMethodPicker } from "@/components/admin/admin-finance-payment-method-picker";
import {
  AdminFinancePaymentStatusPicker,
  type AdminUpdatablePaymentStatus,
} from "@/components/admin/admin-finance-payment-status-picker";
import { PaymentStatusReasonText } from "@/components/shared/payment-status-reason-text";
import { ApiError, apiFetch } from "@/lib/api";
import type { StudioManualPaymentMethod } from "@/lib/payment-confirmation";

type AdminStaffPaymentEditorsProps = {
  paymentId: string;
  status: string;
  paymentMethod: string | null;
  statusReason?: string | null;
  onUpdated: (next: {
    status: string;
    paymentMethod: string | null;
  }) => void;
  onError?: (message: string) => void;
  /** `row` places status and method chips on one line (package cards). */
  layout?: "stack" | "row";
};

export function AdminStaffPaymentEditors({
  paymentId,
  status,
  paymentMethod,
  statusReason,
  onUpdated,
  onError,
  layout = "stack",
}: AdminStaffPaymentEditorsProps) {
  const t = useTranslations("adminPages.finance.paymentActions");
  const [busy, setBusy] = useState(false);

  async function changeStatus(nextStatus: AdminUpdatablePaymentStatus) {
    setBusy(true);
    try {
      await apiFetch(`/payments/admin/${paymentId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      onUpdated({ status: nextStatus, paymentMethod });
    } catch (error) {
      onError?.(error instanceof ApiError ? error.message : t("actionFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function changeMethod(nextMethod: StudioManualPaymentMethod) {
    setBusy(true);
    try {
      await apiFetch(`/payments/admin/${paymentId}/method`, {
        method: "PATCH",
        body: JSON.stringify({ paymentMethod: nextMethod }),
      });
      onUpdated({ status, paymentMethod: nextMethod });
    } catch (error) {
      onError?.(error instanceof ApiError ? error.message : t("actionFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={
        layout === "row"
          ? "flex flex-wrap items-center gap-2"
          : "flex flex-col items-start gap-2"
      }
    >
      <AdminFinancePaymentStatusPicker
        status={status}
        paymentMethod={paymentMethod}
        busy={busy}
        onChangeStatus={(nextStatus) => {
          void changeStatus(nextStatus);
        }}
      />
      <PaymentStatusReasonText status={status} reason={statusReason} />
      <AdminFinancePaymentMethodPicker
        paymentMethod={paymentMethod}
        busy={busy}
        onChangeMethod={(nextMethod) => {
          void changeMethod(nextMethod);
        }}
      />
    </div>
  );
}
