"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";
import { isCardPaymentMethod } from "@/lib/payment-confirmation";

export type ArcaSyncOutcome =
  | "deposited"
  | "failed"
  | "in_progress"
  | "not_found"
  | "error";

type ArcaSyncResponse = { outcome: ArcaSyncOutcome };

const PENDING_STATUS = "PENDING";

type AdminFinanceArcaSyncButtonProps = {
  paymentId: string;
  status: string;
  paymentMethod: string | null;
  onSynced: (outcome: ArcaSyncOutcome) => void;
};

/** On-demand "check status in bank" for a pending Arca card payment. */
export function AdminFinanceArcaSyncButton({
  paymentId,
  status,
  paymentMethod,
  onSynced,
}: AdminFinanceArcaSyncButtonProps) {
  const t = useTranslations("adminPages.finance.paymentActions");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isCardPaymentMethod(paymentMethod) || status !== PENDING_STATUS) {
    return null;
  }

  async function checkStatus() {
    setBusy(true);
    setMessage(null);
    try {
      const result = await apiFetch<ArcaSyncResponse>(
        `/payments/admin/${paymentId}/arca/sync`,
        { method: "POST" },
      );
      onSynced(result.outcome);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t("actionFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <OmmButton
        type="button"
        size="sm"
        disabled={busy}
        onClick={() => void checkStatus()}
      >
        {busy ? t("bankChecking") : t("bankCheck")}
      </OmmButton>
      {message ? (
        <p className="text-sm text-rose-700" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}

/** Maps a sync outcome onto the resulting payment status (unchanged for non-final outcomes). */
export function arcaOutcomeToStatus(
  outcome: ArcaSyncOutcome,
  currentStatus: string,
): string {
  if (outcome === "deposited") return "SUCCEEDED";
  if (outcome === "failed") return "FAILED";
  return currentStatus;
}
