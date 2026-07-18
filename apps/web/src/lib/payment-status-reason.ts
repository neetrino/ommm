/** Shared payment status-reason codes (API `statusReason` / metadata.statusReason). */
export const PAYMENT_STATUS_REASON = {
  AWAITING_BANK: "awaiting_bank",
  BANK_PROCESSING: "bank_processing",
  SESSION_EXPIRED: "session_expired",
  CARD_DECLINED: "card_declined",
  INSUFFICIENT_FUNDS: "insufficient_funds",
  CHECKOUT_NOT_STARTED: "checkout_not_started",
  REGISTER_FAILED: "register_failed",
  ABANDONED: "abandoned",
  DUPLICATE_ATTEMPT: "duplicate_attempt",
  REVERSED: "reversed",
  REFUNDED: "refunded",
  AWAITING_CASH: "awaiting_cash",
  ADMIN_REJECTED: "admin_rejected",
  UNKNOWN: "unknown",
} as const;

export type PaymentStatusReason =
  (typeof PAYMENT_STATUS_REASON)[keyof typeof PAYMENT_STATUS_REASON];

const REASON_SET = new Set<string>(Object.values(PAYMENT_STATUS_REASON));

/** True when a reason should be shown under PENDING / FAILED badges. */
export function shouldShowPaymentStatusReason(
  status: string,
  reason: string | null | undefined,
): reason is PaymentStatusReason {
  if (reason === null || reason === undefined || !REASON_SET.has(reason)) {
    return false;
  }
  return status === "PENDING" || status === "FAILED";
}
