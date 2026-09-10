import { ManualPaymentMethod, PaymentStatus } from '@prisma/client';

const STUDIO_MANUAL_PAYMENT_METHODS = [
  ManualPaymentMethod.CASH,
  ManualPaymentMethod.CARD_TERMINAL,
] as const;

export type StudioManualPaymentMethod =
  (typeof STUDIO_MANUAL_PAYMENT_METHODS)[number];

/** Cash or physical terminal — paid at the studio, not via the website bank. */
export function isStudioManualPaymentMethod(
  paymentMethod: ManualPaymentMethod | string | null,
): paymentMethod is StudioManualPaymentMethod {
  return (
    paymentMethod === ManualPaymentMethod.CASH ||
    paymentMethod === ManualPaymentMethod.CARD_TERMINAL
  );
}

export function canSwapStudioPaymentMethod(
  paymentMethod: ManualPaymentMethod | string | null,
): boolean {
  return isStudioManualPaymentMethod(paymentMethod);
}

/** Online CARD: fail abandoned checkout, or refund/fail after a bank success. */
export function isAllowedCardStatusTransition(
  current: PaymentStatus,
  next: PaymentStatus,
): boolean {
  if (current === next) {
    return true;
  }
  if (current === PaymentStatus.PENDING && next === PaymentStatus.FAILED) {
    return true;
  }
  if (
    current === PaymentStatus.SUCCEEDED &&
    (next === PaymentStatus.FAILED || next === PaymentStatus.REFUNDED)
  ) {
    return true;
  }
  return false;
}

/**
 * Studio cash/terminal: confirm or cancel unpaid; unmark or refund paid.
 * FAILED and REFUNDED are terminal so stock/gift credits cannot loop.
 */
export function isAllowedStudioStatusTransition(
  current: PaymentStatus,
  next: PaymentStatus,
): boolean {
  if (current === next) {
    return true;
  }
  if (current === PaymentStatus.PENDING) {
    return (
      next === PaymentStatus.SUCCEEDED ||
      next === PaymentStatus.FAILED ||
      next === PaymentStatus.REFUNDED
    );
  }
  if (current === PaymentStatus.SUCCEEDED) {
    return next === PaymentStatus.PENDING || next === PaymentStatus.REFUNDED;
  }
  return false;
}
