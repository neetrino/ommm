import { ManualPaymentMethod } from '@prisma/client';
import { EHDM_GOOD_NAME_MAX_LENGTH, EHDM_PRINT_MODE } from './ehdm.constants';
import type { EhdmConfig } from './ehdm.config';
import type { EhdmPrintRequestBody } from './ehdm.types';

type BuildPrintBodyArgs = {
  paymentId: string;
  paymentReference: string | null;
  amountCents: number;
  paymentMethod: ManualPaymentMethod | null;
  itemName: string;
  itemCode: string;
  seq: number;
};

export function buildEhdmPrintBody(
  config: EhdmConfig,
  args: BuildPrintBodyArgs,
): EhdmPrintRequestBody {
  const totalAmd = centsToAmd(args.amountCents);
  const isCard = args.paymentMethod === ManualPaymentMethod.CARD;

  return {
    crn: config.getCrn(),
    seq: args.seq,
    mode: EHDM_PRINT_MODE.SALE_WITH_ITEMS,
    cashierId: config.getCashierId(),
    cardAmount: isCard ? totalAmd : 0,
    cashAmount: isCard ? 0 : totalAmd,
    partialAmount: 0,
    prePaymentAmount: 0,
    partnerTin: null,
    items: [
      {
        dep: config.getDep(),
        adgCode: config.getDefaultAdgCode(),
        goodCode: sanitizeGoodCode(args.itemCode || args.paymentId),
        goodName: truncateGoodName(args.itemName),
        quantity: 1,
        unit: config.getDefaultUnit(),
        price: totalAmd,
      },
    ],
  };
}

export function resolveEhdmItemName(
  relatedItemName: string | null,
  description: string | null,
): string {
  const fromRelated = relatedItemName?.trim();
  if (fromRelated) {
    return fromRelated;
  }
  const fromDescription = description?.trim();
  if (fromDescription) {
    return fromDescription;
  }
  return 'Վճարում';
}

export function resolveEhdmItemCode(
  paymentReference: string | null,
  paymentId: string,
): string {
  const reference = paymentReference?.trim();
  if (reference) {
    return reference;
  }
  return paymentId.slice(-12);
}

function centsToAmd(amountCents: number): number {
  return Math.round(amountCents) / 100;
}

function truncateGoodName(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= EHDM_GOOD_NAME_MAX_LENGTH) {
    return trimmed;
  }
  return trimmed.slice(0, EHDM_GOOD_NAME_MAX_LENGTH);
}

function sanitizeGoodCode(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return 'PAYMENT';
  }
  return trimmed.slice(0, 32);
}
