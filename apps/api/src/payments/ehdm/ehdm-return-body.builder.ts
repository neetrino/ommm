import { ManualPaymentMethod } from '@prisma/client';
import { EHDM_RETURN_PRODUCT_ID } from './ehdm.constants';
import type { EhdmConfig } from './ehdm.config';
import { toAmdMajorUnits } from './ehdm-print-body.builder';
import { resolveEhdmTenderSplit } from './ehdm-tender.util';
import type { EhdmReturnRequestBody } from './ehdm.types';

type BuildReturnBodyArgs = {
  receiptId: string;
  amountCents: number;
  paymentMethod: ManualPaymentMethod | null;
  seq: number;
};

export function buildEhdmReturnBody(
  config: EhdmConfig,
  args: BuildReturnBodyArgs,
): EhdmReturnRequestBody {
  const tender = resolveEhdmTenderSplit(
    toAmdMajorUnits(args.amountCents),
    args.paymentMethod,
  );
  return {
    crn: config.getCrn(),
    seq: args.seq,
    receiptId: toEhdmReceiptIdNumber(args.receiptId),
    cardAmountForReturn: tender.cardAmount,
    cashAmountForReturn: tender.cashAmount,
    returnItemList: [{ receiptProductId: EHDM_RETURN_PRODUCT_ID, quantity: 1 }],
  };
}

export function toEhdmReceiptIdNumber(receiptId: string): number {
  const parsed = Number.parseInt(receiptId, 10);
  if (!Number.isFinite(parsed)) {
    throw new Error('EHDM receiptId is not numeric');
  }
  return parsed;
}
