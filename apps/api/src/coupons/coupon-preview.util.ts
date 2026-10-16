import { BadRequestException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { COUPON_ERROR } from './coupon.constants';
import {
  peekSpendableGiftCreditsCents,
  resolveGiftCreditsApplication,
} from '../packages/package-gift-credits.util';
import { quoteCoupon } from './coupon-quote.util';
import type { CouponPurchaseLine, CouponSnapshot } from './coupon.types';

export type CouponPreview = CouponSnapshot & {
  giftCreditsAppliedCents: number;
  chargeCents: number;
};

/** Prices a code without reserving it. Gift credit is applied after the coupon. */
export async function previewCouponCheckout(
  db: PrismaService,
  input: {
    userId: string;
    code: string;
    subtotalCents: number;
    lines: readonly CouponPurchaseLine[];
    useGiftCredits: boolean;
    giftCardIds?: readonly string[];
  },
): Promise<CouponPreview> {
  const snapshot = await quoteCoupon(db, input);
  if (snapshot === null) {
    throw new BadRequestException(COUPON_ERROR.INVALID);
  }
  const spendable = input.useGiftCredits
    ? await peekSpendableGiftCreditsCents(db, input.userId, input.giftCardIds)
    : 0;
  const gift = resolveGiftCreditsApplication({
    useGiftCredits: input.useGiftCredits,
    spendableCents: spendable,
    finalPriceCents: snapshot.amountAfterCouponCents,
  });
  return {
    ...snapshot,
    giftCreditsAppliedCents: gift.appliedCents,
    chargeCents: gift.chargeCents,
  };
}
