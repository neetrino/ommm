import { GiftCardStatus, PaymentStatus } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';
import { readGiftAmount } from './reports.helpers';
import {
  GIFT_CREDIT_SPEND_PREFIX,
  STUDIO_ANALYTICS_ROW_CAP,
} from './studio-analytics.helpers';
import type { StudioAnalyticsPayload } from './studio-analytics.types';

export async function loadStudioAnalyticsGiftCredits(
  prisma: PrismaService,
  from: Date,
  to: Date,
): Promise<StudioAnalyticsPayload['revenue']['giftCredits']> {
  const dateFilter = { gte: from, lte: to };
  const [issuedGiftCards, redeemedGiftCards, giftSpentAgg, giftLiabilityAgg] =
    await Promise.all([
      prisma.giftCard.findMany({
        where: { createdAt: dateFilter },
        take: STUDIO_ANALYTICS_ROW_CAP,
      }),
      prisma.giftCard.findMany({
        where: { status: GiftCardStatus.REDEEMED, updatedAt: dateFilter },
        take: STUDIO_ANALYTICS_ROW_CAP,
      }),
      prisma.payment.aggregate({
        where: {
          createdAt: dateFilter,
          status: PaymentStatus.SUCCEEDED,
          description: { startsWith: GIFT_CREDIT_SPEND_PREFIX },
        },
        _sum: { amountCents: true },
        _count: { id: true },
      }),
      prisma.user.aggregate({ _sum: { giftCreditsCents: true } }),
    ]);
  return {
    issuedCents: issuedGiftCards.reduce(
      (sum, card) => sum + readGiftAmount(card),
      0,
    ),
    issuedCount: issuedGiftCards.length,
    redeemedCents: redeemedGiftCards.reduce(
      (sum, card) => sum + readGiftAmount(card),
      0,
    ),
    redeemedCount: redeemedGiftCards.length,
    spentCents: giftSpentAgg._sum.amountCents ?? 0,
    spendTransactionsCount: giftSpentAgg._count.id ?? 0,
    outstandingCreditsCents: giftLiabilityAgg._sum.giftCreditsCents ?? 0,
  };
}
