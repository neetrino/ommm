import type { FinancePaymentItem } from "@/components/admin/admin-finance-types";
import type { PaymentOutcomePayload } from "@/lib/payment-outcome-types";

/** Maps an admin payment row to the member fiscal-receipt printer payload. */
export function toAdminEhdmReceiptPayload(
  payment: FinancePaymentItem,
): PaymentOutcomePayload | null {
  const receipt = payment.ehdmReceipt;
  if (!receipt) {
    return null;
  }
  return {
    paymentReference: payment.paymentReference,
    status: payment.status,
    amountCents: payment.amountCents,
    currency: payment.currency,
    description: payment.relatedItemName ?? payment.description,
    paymentMethod: payment.paymentMethod,
    paidAt: payment.confirmedAt ?? payment.createdAt,
    ehdmReceipt: receipt,
  };
}
