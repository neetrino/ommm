export const MANUAL_PAYMENT_METHODS = [
  "CASH",
  "CARD",
  "CARD_TERMINAL",
  "BANK_TRANSFER",
  "OTHER",
  "INFLUENCER",
] as const;

export type ManualPaymentMethod = (typeof MANUAL_PAYMENT_METHODS)[number];

/** Payment methods shown in the package subscribe confirmation modal. */
export const PACKAGE_SUBSCRIBE_PAYMENT_METHODS = ["CARD"] as const satisfies
  readonly ManualPaymentMethod[];

/** Admin Client Packages purchase — Cash, physical terminal, or influencer comp. */
export const ADMIN_CLIENT_PACKAGE_PAYMENT_METHODS = [
  "CASH",
  "CARD_TERMINAL",
  "INFLUENCER",
] as const satisfies readonly ManualPaymentMethod[];

export type AdminClientPackagePaymentMethod =
  (typeof ADMIN_CLIENT_PACKAGE_PAYMENT_METHODS)[number];

export function isManualPaymentMethod(value: string): value is ManualPaymentMethod {
  return (MANUAL_PAYMENT_METHODS as readonly string[]).includes(value);
}
