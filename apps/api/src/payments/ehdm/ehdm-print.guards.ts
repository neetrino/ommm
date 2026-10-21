import { ManualPaymentMethod, PaymentStatus } from '@prisma/client';

export type EhdmPrintCandidate = {
  status: PaymentStatus;
  currency: string;
  amountCents: number;
  paymentMethod: ManualPaymentMethod | null;
  ehdmReceipt: { id: string } | null;
};

export function skipReasonForEhdmPrint(
  payment: EhdmPrintCandidate,
): string | null {
  if (payment.status !== PaymentStatus.SUCCEEDED) {
    return 'payment is not SUCCEEDED';
  }
  if (payment.ehdmReceipt) {
    return 'receipt already exists';
  }
  if (payment.currency.toLowerCase() !== 'amd') {
    return 'currency is not AMD';
  }
  if (payment.amountCents <= 0) {
    return 'amount is not positive';
  }
  if (payment.paymentMethod !== ManualPaymentMethod.CARD) {
    return 'payment method is not online card';
  }
  return null;
}

export type EhdmReturnCandidate = {
  currency: string;
  ehdmReceipt: {
    receiptId: string;
    returnReceiptId: string | null;
    isMock: boolean;
  } | null;
};

export function skipReasonForEhdmReturn(
  payment: EhdmReturnCandidate,
): string | null {
  if (payment.currency.toLowerCase() !== 'amd') {
    return 'currency is not AMD';
  }
  if (!payment.ehdmReceipt || payment.ehdmReceipt.isMock) {
    return 'sale receipt is missing';
  }
  if (payment.ehdmReceipt.returnReceiptId) {
    return 'return receipt already exists';
  }
  return null;
}
