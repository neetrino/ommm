export const MANUAL_PAYMENT_METHODS = [
  "CASH",
  "CARD",
  "BANK_TRANSFER",
  "OTHER",
] as const;

export type ManualPaymentMethod = (typeof MANUAL_PAYMENT_METHODS)[number];

/** Payment methods shown in the package subscribe confirmation modal. */
export const PACKAGE_SUBSCRIBE_PAYMENT_METHODS = ["CARD"] as const satisfies
  readonly ManualPaymentMethod[];

export function isManualPaymentMethod(value: string): value is ManualPaymentMethod {
  return (MANUAL_PAYMENT_METHODS as readonly string[]).includes(value);
}
