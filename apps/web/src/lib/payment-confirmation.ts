import type { ManualPaymentMethod } from "@/lib/manual-payment-method";

const PENDING_STATUS = "PENDING";
const SUCCEEDED_STATUS = "SUCCEEDED";
const CARD_METHOD: ManualPaymentMethod = "CARD";
const STUDIO_METHODS = ["CASH", "CARD_TERMINAL"] as const;

export type StudioManualPaymentMethod = (typeof STUDIO_METHODS)[number];
export type AdminUpdatablePaymentStatus =
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED"
  | "REFUNDED";

const STUDIO_PENDING_STATUSES: readonly AdminUpdatablePaymentStatus[] = [
  "PENDING",
  "SUCCEEDED",
  "FAILED",
  "REFUNDED",
];
const STUDIO_SUCCEEDED_STATUSES: readonly AdminUpdatablePaymentStatus[] = [
  "SUCCEEDED",
  "PENDING",
  "REFUNDED",
];

/** Manual payments stay pending until staff confirms receipt. Card checkout auto-confirms. */
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

export function isStudioManualPaymentMethod(
  paymentMethod: string | null,
): paymentMethod is StudioManualPaymentMethod {
  return paymentMethod === "CASH" || paymentMethod === "CARD_TERMINAL";
}

export function canSwapStudioPaymentMethod(paymentMethod: string | null): boolean {
  return isStudioManualPaymentMethod(paymentMethod);
}

export function adminPaymentStatusOptions(
  paymentMethod: string | null,
  status: string,
): readonly AdminUpdatablePaymentStatus[] {
  if (isCardPaymentMethod(paymentMethod)) {
    if (status === PENDING_STATUS) {
      return [];
    }
    if (status === SUCCEEDED_STATUS) {
      return ["SUCCEEDED", "FAILED", "REFUNDED"];
    }
    return [];
  }
  if (!isStudioManualPaymentMethod(paymentMethod)) {
    return [];
  }
  if (status === PENDING_STATUS) {
    return STUDIO_PENDING_STATUSES;
  }
  if (status === SUCCEEDED_STATUS) {
    return STUDIO_SUCCEEDED_STATUSES;
  }
  return [];
}
