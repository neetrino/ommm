"use client";

import { toAdminEhdmReceiptPayload } from "@/components/admin/admin-finance-ehdm-receipt-payload";
import type { FinancePaymentItem } from "@/components/admin/admin-finance-types";
import { PaymentEhdmReceiptPrinter } from "@/components/payment/payment-ehdm-receipt-printer";

type AdminFinancePaymentEhdmPrinterProps = {
  payment: FinancePaymentItem;
  locale: string;
};

export function AdminFinancePaymentEhdmPrinter({
  payment,
  locale,
}: AdminFinancePaymentEhdmPrinterProps) {
  const payload = toAdminEhdmReceiptPayload(payment);
  if (!payload) {
    return null;
  }

  return (
    <div className="mt-5 rounded-2xl border border-sage-200/80 bg-white px-3 py-5 shadow-[0_12px_32px_-18px_rgba(45,40,35,0.28)] sm:px-4">
      <PaymentEhdmReceiptPrinter payload={payload} locale={locale} />
    </div>
  );
}
