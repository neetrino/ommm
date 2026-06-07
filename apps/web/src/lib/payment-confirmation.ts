import type { ManualPaymentMethod } from "@/lib/manual-payment-method";

const PENDING_STATUS = "PENDING";
const CARD_METHOD: ManualPaymentMethod = "CARD";

/** Manual payments stay pending until an admin confirms receipt. Card checkout auto-confirms. */
export function requiresManualAdminConfirmation(
  paymentMethod: string | null,
  status: string,
): boolean {
  return status === PENDING_STATUS && !isCardPaymentMethod(paymentMethod);
}

/** Card payments are confirmed automatically after the user checkout flow. */
export function isCardPaymentMethod(
  paymentMethod: string | null,
): paymentMethod is typeof CARD_METHOD {
  return paymentMethod === CARD_METHOD;
}
