import { ManualPaymentMethod, PaymentStatus } from '@prisma/client';

type PaymentConfirmationFields = {
  status: PaymentStatus;
  paymentMethod: ManualPaymentMethod | null;
};

/** Manual payments stay pending until an admin confirms receipt. Card checkout auto-confirms. */
export function requiresManualAdminConfirmation(
  payment: PaymentConfirmationFields,
): boolean {
  return (
    payment.status === PaymentStatus.PENDING &&
    payment.paymentMethod !== ManualPaymentMethod.CARD
  );
}

/** Card payments are confirmed automatically after the user payment flow. */
export function isCardAutoConfirmable(
  paymentMethod: ManualPaymentMethod,
): boolean {
  return paymentMethod === ManualPaymentMethod.CARD;
}

/** Booking access is gated on package status, not payment method. */
export function grantsImmediatePackageBookingAccess(
  paymentMethod: ManualPaymentMethod,
): boolean {
  void paymentMethod;
  return false;
}
