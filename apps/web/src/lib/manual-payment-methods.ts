/** Offline payment methods for manual package subscriptions (no card data). */
export const MANUAL_PAYMENT_METHODS = [
  "CASH",
  "CARD",
  "BANK_TRANSFER",
  "OTHER",
] as const;

export type ManualPaymentMethod = (typeof MANUAL_PAYMENT_METHODS)[number];

export function isManualPaymentMethod(value: string): value is ManualPaymentMethod {
  return (MANUAL_PAYMENT_METHODS as readonly string[]).includes(value);
}
