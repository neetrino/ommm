import { ManualPaymentMethod } from '@prisma/client';

export type EhdmTenderSplit = {
  cardAmount: number;
  cashAmount: number;
};

export function isEhdmCardTender(
  paymentMethod: ManualPaymentMethod | null,
): boolean {
  return (
    paymentMethod === ManualPaymentMethod.CARD ||
    paymentMethod === ManualPaymentMethod.CARD_TERMINAL
  );
}

/** PEC tender split in AMD major units. Card/terminal → card; everything else → cash. */
export function resolveEhdmTenderSplit(
  amountAmd: number,
  paymentMethod: ManualPaymentMethod | null,
): EhdmTenderSplit {
  if (isEhdmCardTender(paymentMethod)) {
    return { cardAmount: amountAmd, cashAmount: 0 };
  }
  return { cardAmount: 0, cashAmount: amountAmd };
}
