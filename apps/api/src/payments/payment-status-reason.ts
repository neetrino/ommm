/**
 * Short machine codes for why a payment is PENDING / FAILED.
 * Shown in admin + member UI via i18n (`paymentStatusReasons.*`).
 */
export const PAYMENT_STATUS_REASON = {
  AWAITING_BANK: 'awaiting_bank',
  BANK_PROCESSING: 'bank_processing',
  SESSION_EXPIRED: 'session_expired',
  CARD_DECLINED: 'card_declined',
  INSUFFICIENT_FUNDS: 'insufficient_funds',
  CHECKOUT_NOT_STARTED: 'checkout_not_started',
  REGISTER_FAILED: 'register_failed',
  ABANDONED: 'abandoned',
  DUPLICATE_ATTEMPT: 'duplicate_attempt',
  REVERSED: 'reversed',
  REFUNDED: 'refunded',
  AWAITING_CASH: 'awaiting_cash',
  ADMIN_REJECTED: 'admin_rejected',
  UNKNOWN: 'unknown',
} as const;

export type PaymentStatusReason =
  (typeof PAYMENT_STATUS_REASON)[keyof typeof PAYMENT_STATUS_REASON];

const REASON_SET = new Set<string>(Object.values(PAYMENT_STATUS_REASON));

/** Narrows an unknown metadata value to a known status reason code. */
export function parsePaymentStatusReason(
  raw: unknown,
): PaymentStatusReason | null {
  if (typeof raw !== 'string') {
    return null;
  }
  return REASON_SET.has(raw) ? (raw as PaymentStatusReason) : null;
}

/** Reads `statusReason` from Payment.metadata JSON. */
export function readPaymentStatusReason(
  metadata: unknown,
): PaymentStatusReason | null {
  if (
    metadata === null ||
    typeof metadata !== 'object' ||
    Array.isArray(metadata)
  ) {
    return null;
  }
  return parsePaymentStatusReason(
    (metadata as Record<string, unknown>).statusReason,
  );
}
