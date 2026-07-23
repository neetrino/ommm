"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";
import { requiresManualAdminConfirmation } from "@/lib/payment-confirmation";

type PaymentAdminStatus = "SUCCEEDED" | "FAILED";

type AdminFinancePaymentActionsProps = {
  paymentId: string;
  status: string;
  paymentMethod: string | null;
  onUpdated?: (status: PaymentAdminStatus) => void;
};

export function AdminFinancePaymentActions({
  paymentId,
  status,
  paymentMethod,
  onUpdated,
}: AdminFinancePaymentActionsProps) {
  const t = useTranslations("adminPages.finance.paymentActions");
  const [busy, setBusy] = useState<PaymentAdminStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!requiresManualAdminConfirmation(paymentMethod, status)) {
    return null;
  }

  async function updateStatus(nextStatus: PaymentAdminStatus) {
    setBusy(nextStatus);
    setMessage(null);
    try {
      await apiFetch(`/payments/admin/${paymentId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      onUpdated?.(nextStatus);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t("actionFailed"));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <OmmButton
          type="button"
          size="sm"
          disabled={busy !== null}
          onClick={() => void updateStatus("SUCCEEDED")}
        >
          {busy === "SUCCEEDED" ? t("confirming") : t("markPaid")}
        </OmmButton>
        <OmmButton
          type="button"
          size="sm"
          variant="ghost"
          disabled={busy !== null}
          onClick={() => void updateStatus("FAILED")}
        >
          {busy === "FAILED" ? t("rejecting") : t("reject")}
        </OmmButton>
      </div>
      {message ? (
        <p className="text-sm text-rose-700" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}
