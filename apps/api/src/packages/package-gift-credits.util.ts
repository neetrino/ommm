import { BadRequestException } from '@nestjs/common';
import {
  GiftCardStatus,
  PaymentSource,
  PaymentStatus,
  type Prisma,
} from '@prisma/client';
import { readGiftCardBalance } from '../gift-cards/gift-cards.mapper';
import { GIFT_CREDIT_SPEND_PREFIX } from '../reports/studio-analytics.helpers';

export const PACKAGE_GIFT_CREDITS_APPLIED_KEY = 'giftCreditsAppliedCents';

type GiftCreditsDb = Pick<
  Prisma.TransactionClient,
  'user' | 'giftCard' | 'payment'
>;

type GiftCreditsWalletDb = Pick<Prisma.TransactionClient, 'user'>;

/** Sum of wallet + ACTIVE received gift-card balances (read-only). */
export async function peekSpendableGiftCreditsCents(
  db: GiftCreditsDb,
  userId: string,
): Promise<number> {
  const now = new Date();
  const [user, cards] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { giftCreditsCents: true },
    }),
    db.giftCard.findMany({
      where: {
        recipientId: userId,
        status: GiftCardStatus.ACTIVE,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      select: { id: true, balanceAmd: true },
      take: 50,
    }),
  ]);
  const walletCents = Math.max(0, user?.giftCreditsCents ?? 0);
  const cardsCents = cards.reduce((sum, card) => {
    const balance = readGiftCardBalance(card);
    return sum + Math.max(0, balance);
  }, 0);
  return walletCents + cardsCents;
}

export function resolveGiftCreditsApplication(params: {
  useGiftCredits: boolean;
  spendableCents: number;
  finalPriceCents: number;
}): { appliedCents: number; chargeCents: number } {
  if (!params.useGiftCredits || params.spendableCents <= 0) {
    return { appliedCents: 0, chargeCents: params.finalPriceCents };
  }
  const appliedCents = Math.min(params.spendableCents, params.finalPriceCents);
  return {
    appliedCents,
    chargeCents: params.finalPriceCents - appliedCents,
  };
}

/** Moves ACTIVE received gift-card balances into the member wallet. */
export async function consolidateReceivedGiftCardsToWallet(
  db: GiftCreditsDb,
  userId: string,
): Promise<number> {
  const now = new Date();
  const cards = await db.giftCard.findMany({
    where: {
      recipientId: userId,
      status: GiftCardStatus.ACTIVE,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: [{ expiresAt: 'asc' }, { createdAt: 'asc' }],
    take: 50,
  });

  let consolidatedCents = 0;
  for (const card of cards) {
    const balance = readGiftCardBalance(card);
    if (balance <= 0) {
      continue;
    }
    await db.giftCard.update({
      where: { id: card.id },
      data: {
        balanceAmd: 0,
        status: GiftCardStatus.REDEEMED,
      },
    });
    consolidatedCents += balance;
  }

  if (consolidatedCents > 0) {
    await db.user.update({
      where: { id: userId },
      data: { giftCreditsCents: { increment: consolidatedCents } },
    });
  }
  return consolidatedCents;
}

/** Reserves wallet credit for a package checkout (refunded if card payment fails). */
export async function reserveGiftCreditsForPackage(
  db: GiftCreditsDb,
  params: { userId: string; appliedCents: number },
): Promise<void> {
  if (params.appliedCents <= 0) {
    return;
  }
  await consolidateReceivedGiftCardsToWallet(db, params.userId);
  const updated = await db.user.updateMany({
    where: {
      id: params.userId,
      giftCreditsCents: { gte: params.appliedCents },
    },
    data: { giftCreditsCents: { decrement: params.appliedCents } },
  });
  if (updated.count !== 1) {
    throw new BadRequestException('Insufficient gift card credit');
  }
}

export async function refundReservedGiftCredits(
  db: GiftCreditsWalletDb,
  params: { userId: string; appliedCents: number },
): Promise<void> {
  if (params.appliedCents <= 0) {
    return;
  }
  await db.user.update({
    where: { id: params.userId },
    data: { giftCreditsCents: { increment: params.appliedCents } },
  });
}

/** Records analytics-compatible gift credit spend after package activation. */
export async function recordGiftCreditSpendPayment(
  db: GiftCreditsDb,
  params: {
    userId: string;
    appliedCents: number;
    planName: string;
    userPackageId: string;
    currency: string;
  },
): Promise<void> {
  if (params.appliedCents <= 0) {
    return;
  }
  await db.payment.create({
    data: {
      userId: params.userId,
      amountCents: params.appliedCents,
      currency: params.currency.toLowerCase(),
      status: PaymentStatus.SUCCEEDED,
      source: PaymentSource.OTHER,
      sourceId: params.userPackageId,
      description: `${GIFT_CREDIT_SPEND_PREFIX} for package ${params.planName.trim()}`,
      confirmedAt: new Date(),
    },
  });
}

export function readGiftCreditsAppliedCents(
  metadata: Prisma.JsonValue | Prisma.InputJsonValue | null | undefined,
): number {
  if (
    metadata === null ||
    metadata === undefined ||
    typeof metadata !== 'object' ||
    Array.isArray(metadata)
  ) {
    return 0;
  }
  const value = (metadata as Record<string, unknown>)[
    PACKAGE_GIFT_CREDITS_APPLIED_KEY
  ];
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;
}
