import type { ManualPaymentMethod } from "@/lib/manual-payment-method";

const PENDING_STATUS = "PENDING";
const CASH_METHOD: ManualPaymentMethod = "CASH";

/** Cash payments stay pending until an admin confirms receipt. */
export function requiresManualAdminConfirmation(
  paymentMethod: string | null,
  status: string,
): boolean {
  return status === PENDING_STATUS && paymentMethod === CASH_METHOD;
}
