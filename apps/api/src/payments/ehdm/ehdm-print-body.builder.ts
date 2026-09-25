import { ManualPaymentMethod } from '@prisma/client';
import {
  EHDM_DEFAULT_ADG_CODE,
  EHDM_DEFAULT_ITEM_NAME,
  EHDM_DISCOUNT_TYPE_UNIT_PRICE,
  EHDM_GOOD_CODE_MAX_LENGTH,
  EHDM_GOOD_NAME_MAX_LENGTH,
  EHDM_PRINT_MODE,
} from './ehdm.constants';
import type { EhdmConfig } from './ehdm.config';
import { resolveEhdmTenderSplit } from './ehdm-tender.util';
import type { EhdmPrintRequestBody } from './ehdm.types';

type BuildPrintBodyArgs = {
  paymentId: string;
  paymentReference: string | null;
  /** Amount actually charged (after gift-card credit). */
  amountCents: number;
  /** Gift-card credit taken off the list price. Zero omits discount fields. */
  discountAmd?: number;
  paymentMethod: ManualPaymentMethod | null;
  itemName: string;
  itemCode: string;
  seq: number;
};

export function buildEhdmPrintBody(
  config: EhdmConfig,
  args: BuildPrintBodyArgs,
): EhdmPrintRequestBody {
  const paidAmd = toAmdMajorUnits(args.amountCents);
  const discountAmd = resolveEhdmDiscountAmd(args.discountAmd);
  const tender = resolveEhdmTenderSplit(paidAmd, args.paymentMethod);

  return {
    crn: config.getCrn(),
    seq: args.seq,
    mode: EHDM_PRINT_MODE.SALE_WITH_ITEMS,
    cashierId: config.getCashierId(),
    cardAmount: tender.cardAmount,
    cashAmount: tender.cashAmount,
    partialAmount: 0,
    prePaymentAmount: 0,
    partnerTin: null,
    items: [
      {
        dep: config.getDep(),
        adgCode: EHDM_DEFAULT_ADG_CODE,
        goodCode: sanitizeGoodCode(args.itemCode || args.paymentId),
        goodName: truncateGoodName(args.itemName),
        quantity: 1,
        unit: config.getDefaultUnit(),
        price: paidAmd + discountAmd,
        ...(discountAmd > 0
          ? {
              discount: discountAmd,
              discountType: EHDM_DISCOUNT_TYPE_UNIT_PRICE,
            }
          : {}),
      },
    ],
  };
}

/** Whole AMD gift-card discount. Non-positive values are omitted from the receipt. */
export function resolveEhdmDiscountAmd(discountAmd: number | undefined): number {
  if (discountAmd === undefined || !Number.isFinite(discountAmd) || discountAmd <= 0) {
    return 0;
  }
  return Math.round(discountAmd);
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
  return EHDM_DEFAULT_ITEM_NAME;
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

/** OMMM `amountCents` stores whole AMD (dram), not minor units. */
export function toAmdMajorUnits(amountCents: number): number {
  return Math.round(amountCents);
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
  return trimmed.slice(0, EHDM_GOOD_CODE_MAX_LENGTH);
}
