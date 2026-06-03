"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api";

type PaymentAdminStatus = "SUCCEEDED" | "FAILED";

type AdminFinancePaymentActionsProps = {
  paymentId: string;
  status: string;
};

export function AdminFinancePaymentActions({
  paymentId,
  status,
}: AdminFinancePaymentActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState<PaymentAdminStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (status !== "PENDING") {
    return <span className="text-xs text-sage-400">—</span>;
  }

  async function updateStatus(nextStatus: PaymentAdminStatus) {
    setBusy(nextStatus);
    setMessage(null);
    try {
      await apiFetch(`/payments/admin/${paymentId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      router.refresh();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Payment update failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void updateStatus("SUCCEEDED")}
          className="rounded-full bg-mint-100 px-3 py-1 text-xs font-medium text-mint-900 disabled:opacity-50"
        >
          {busy === "SUCCEEDED" ? "Confirming..." : "Mark paid"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void updateStatus("FAILED")}
          className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-900 disabled:opacity-50"
        >
          {busy === "FAILED" ? "Updating..." : "Fail"}
        </button>
      </div>
      {message ? <p className="max-w-48 text-xs text-rose-700">{message}</p> : null}
    </div>
  );
}
