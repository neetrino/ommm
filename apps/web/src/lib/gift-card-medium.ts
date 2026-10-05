/**
 * Printed gift-card surcharge, in whole AMD.
 * Digital cards stay free. Keep in sync with `apps/api/src/payments/gift-card-medium.ts`.
 */
export const PHYSICAL_GIFT_CARD_FEE_AMD = 3_000;

export type GiftCardMedium = "DIGITAL" | "PHYSICAL";

export function physicalGiftCardFeeAmd(medium: GiftCardMedium): number {
  return medium === "PHYSICAL" ? PHYSICAL_GIFT_CARD_FEE_AMD : 0;
}

/** Total the buyer pays: gift face value plus the physical-card fee. */
export function giftPayableAmd(input: {
  faceAmd: number | null;
  medium: GiftCardMedium;
}): number | null {
  if (input.faceAmd === null) {
    return null;
  }
  return input.faceAmd + physicalGiftCardFeeAmd(input.medium);
}
