"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import type { FinancePaymentItem } from "@/components/admin/admin-finance-types";

type Props = {
  payment: FinancePaymentItem;
  onChanged: () => void;
};

export function AdminFinancePaymentActions({ payment, onChanged }: Props) {
  const t = useTranslations("adminPages.finance.paymentActions");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const lockRef = useRef(false);

  const isManualPending =
    payment.paymentMethod !== null && payment.status === "PENDING";

  if (!isManualPending) {
    return <span className="text-xs text-sage-400">—</span>;
  }

  async function updateStatus(status: "SUCCEEDED" | "FAILED") {
    if (busy || lockRef.current) {
      return;
    }
    lockRef.current = true;
    setBusy(true);
    setMessage(null);
    try {
      await apiFetch(`/payments/admin/${payment.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setMessage(
        status === "SUCCEEDED" ? t("markedPaid") : t("markedRejected"),
      );
      onChanged();
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : t("actionFailed"));
    } finally {
      setBusy(false);
      lockRef.current = false;
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-1">
        <button
          type="button"
          className="rounded-lg border border-mint-200 px-2 py-1 text-[11px] font-medium text-mint-900 hover:bg-mint-50 disabled:opacity-50"
          disabled={busy}
          onClick={() => void updateStatus("SUCCEEDED")}
        >
          {t("markPaid")}
        </button>
        <button
          type="button"
          className="rounded-lg border border-rose-200 px-2 py-1 text-[11px] font-medium text-rose-900 hover:bg-rose-50 disabled:opacity-50"
          disabled={busy}
          onClick={() => void updateStatus("FAILED")}
        >
          {t("reject")}
        </button>
      </div>
      {message ? <p className="text-[11px] text-sage-600">{message}</p> : null}
    </div>
  );
}
