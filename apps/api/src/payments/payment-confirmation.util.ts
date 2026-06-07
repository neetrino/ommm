import { ManualPaymentMethod, PaymentStatus } from '@prisma/client';

type PaymentConfirmationFields = {
  status: PaymentStatus;
  paymentMethod: ManualPaymentMethod | null;
};

/** Cash payments stay pending until an admin confirms receipt. */
export function requiresManualAdminConfirmation(
  payment: PaymentConfirmationFields,
): boolean {
  return (
    payment.status === PaymentStatus.PENDING &&
    payment.paymentMethod === ManualPaymentMethod.CASH
  );
}

/** Card payments are confirmed automatically after the user payment flow. */
export function isCardAutoConfirmable(
  paymentMethod: ManualPaymentMethod,
): boolean {
  return paymentMethod === ManualPaymentMethod.CARD;
}
