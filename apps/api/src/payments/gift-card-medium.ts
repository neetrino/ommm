/**
 * Printed gift-card surcharge, in whole AMD.
 * Digital cards stay free. Keep in sync with `apps/web/src/lib/gift-card-medium.ts`.
 */
export const PHYSICAL_GIFT_CARD_FEE_AMD = 3_000;

export type GiftCardMedium = 'DIGITAL' | 'PHYSICAL';

/** Missing or unknown values stay digital so older clients are not charged the print fee. */
export function normalizeGiftCardMedium(
  value: string | undefined,
): GiftCardMedium {
  return value === 'PHYSICAL' ? 'PHYSICAL' : 'DIGITAL';
}

export function physicalGiftCardFeeAmd(medium: GiftCardMedium): number {
  return medium === 'PHYSICAL' ? PHYSICAL_GIFT_CARD_FEE_AMD : 0;
}

/** The buyer pays the gift face value plus the physical-card fee. The card keeps the face value. */
export function giftCheckoutChargeAmd(
  faceAmd: number,
  medium: GiftCardMedium,
): { chargeAmd: number; feeAmd: number } {
  const feeAmd = physicalGiftCardFeeAmd(medium);
  return { chargeAmd: faceAmd + feeAmd, feeAmd };
}

/** Shop batches keep their listed value. Custom gifts use the stored face, not the charged total. */
export function purchasedGiftFaceAmd(input: {
  batchAmountAmd?: number;
  giftFaceAmd?: number;
  chargedAmd: number;
}): number {
  if (input.batchAmountAmd !== undefined) {
    return input.batchAmountAmd;
  }
  return input.giftFaceAmd ?? input.chargedAmd;
}

/** The gift letter names the gift that was given. The printed-card fee stays off that line. */
export function giftEmailAmountAmd(input: {
  giftFaceAmd?: number;
  chargedAmd: number;
  physicalFeeAmd?: number;
}): number | undefined {
  if (input.giftFaceAmd !== undefined && input.giftFaceAmd > 0) {
    return input.giftFaceAmd;
  }
  const feeAmd = input.physicalFeeAmd ?? 0;
  const giftAmd = input.chargedAmd - feeAmd;
  return giftAmd > 0 ? giftAmd : undefined;
}
