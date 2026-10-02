import { BadRequestException } from '@nestjs/common';
import {
  GiftCardStatus,
  GiftCardType,
  PaymentSource,
  PaymentStatus,
  type Prisma,
} from '@prisma/client';
import {
  cardIdsFromAllocations,
  creditGiftCardAmd,
  debitGiftCardAmd,
} from '../gift-cards/gift-card-ledger';
import { compareGiftCardsForSpend } from '../gift-cards/gift-card-policy';
import { readGiftCardBalance } from '../gift-cards/gift-cards.mapper';
import { GIFT_CREDIT_SPEND_PREFIX } from '../reports/studio-analytics.helpers';

import {
  PACKAGE_GIFT_CREDITS_ALLOCATIONS_KEY,
  PACKAGE_GIFT_CREDITS_APPLIED_KEY,
  type GiftCreditAllocation,
} from './package-gift-credits.metadata';

export {
  PACKAGE_GIFT_CREDITS_ALLOCATIONS_KEY,
  PACKAGE_GIFT_CREDITS_APPLIED_KEY,
  PACKAGE_GIFT_CREDITS_REFUNDED_KEY,
  reservedGiftCardIds,
  sameGiftCardSelection,
  type GiftCreditAllocation,
} from './package-gift-credits.metadata';

export function isGiftCreditSpendDescription(
  description: string | null | undefined,
): boolean {
  return (
    typeof description === 'string' &&
    description.startsWith(GIFT_CREDIT_SPEND_PREFIX)
  );
}

type GiftCreditsDb = Pick<
  Prisma.TransactionClient,
  'user' | 'giftCard' | 'payment' | 'giftCardTransaction'
>;

/** Sum of legacy wallet + ACTIVE received gift-card balances (read-only). */
export async function peekSpendableGiftCreditsCents(
  db: GiftCreditsDb,
  userId: string,
  cardIds?: readonly string[],
): Promise<number> {
  const now = new Date();
  const [user, cards] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { giftCreditsCents: true },
    }),
    db.giftCard.findMany({
      where: spendableGiftCardWhere(userId, now, cardIds),
      select: { id: true, balanceAmd: true },
    }),
  ]);
  const walletCents =
    cardIds === undefined ? Math.max(0, user?.giftCreditsCents ?? 0) : 0;
  const cardsCents = cards.reduce((sum, card) => {
    return sum + Math.max(0, readGiftCardBalance(card));
  }, 0);
  return walletCents + cardsCents;
}

function spendableGiftCardWhere(
  userId: string,
  now: Date,
  cardIds?: readonly string[],
) {
  return {
    recipientId: userId,
    status: GiftCardStatus.ACTIVE,
    type: GiftCardType.FIXED_VALUE,
    balanceAmd: { gt: 0 },
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    ...(cardIds !== undefined ? { id: { in: [...cardIds] } } : {}),
  };
}

const MAX_SELECTED_GIFT_CARDS = 10;

/** Drops blanks. An empty selection means “no card filter”. */
export function selectedGiftCardIds(
  ids: readonly string[] | undefined,
): string[] | undefined {
  if (ids === undefined) {
    return undefined;
  }
  const unique = [
    ...new Set(ids.map((id) => id.trim()).filter((id) => id.length > 0)),
  ];
  return unique.length > 0 ? unique.slice(0, MAX_SELECTED_GIFT_CARDS) : undefined;
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

/**
 * Debits gift value nearest-expiry-first (cards keep identity).
 * Legacy `giftCreditsCents` is spent only after card balances.
 */
export async function reserveGiftCreditsForPackage(
  db: GiftCreditsDb,
  params: {
    userId: string;
    appliedCents: number;
    orderId?: string | null;
    /** When set, only these cards are debited. Other cards and the wallet stay. */
    cardIds?: readonly string[];
  },
): Promise<GiftCreditAllocation[]> {
  if (params.appliedCents <= 0) {
    return [];
  }

  const now = new Date();
  const cards = await db.giftCard.findMany({
    where: spendableGiftCardWhere(params.userId, now, params.cardIds),
  });
  cards.sort(compareGiftCardsForSpend);

  const { allocations, remaining } = await debitOrderedGiftCards(db, cards, {
    userId: params.userId,
    appliedCents: params.appliedCents,
    orderId: params.orderId,
  });

  if (remaining > 0 && params.cardIds === undefined) {
    const updated = await db.user.updateMany({
      where: {
        id: params.userId,
        giftCreditsCents: { gte: remaining },
      },
      data: { giftCreditsCents: { decrement: remaining } },
    });
    if (updated.count !== 1) {
      throw new BadRequestException('Insufficient gift card credit');
    }
    allocations.push({ cardId: null, cents: remaining });
    return allocations;
  }
  if (remaining > 0) {
    throw new BadRequestException('Insufficient gift card credit');
  }

  return allocations;
}

async function debitOrderedGiftCards(
  db: GiftCreditsDb,
  cards: Array<{ id: string; code: string; balanceAmd: number }>,
  params: { userId: string; appliedCents: number; orderId?: string | null },
): Promise<{ allocations: GiftCreditAllocation[]; remaining: number }> {
  let remaining = params.appliedCents;
  const allocations: GiftCreditAllocation[] = [];
  for (const card of cards) {
    if (remaining <= 0) {
      break;
    }
    const debited = await debitGiftCardAmd(db, {
      cardId: card.id,
      knownBalance: readGiftCardBalance(card),
      maxTake: remaining,
      userId: params.userId,
      code: card.code,
      orderId: params.orderId,
    });
    if (debited === null || debited.taken <= 0) {
      continue;
    }
    allocations.push({ cardId: card.id, cents: debited.taken });
    remaining -= debited.taken;
  }
  return { allocations, remaining };
}

/** Restores card balances (and legacy wallet) from a prior reservation. */
export async function refundReservedGiftCredits(
  db: GiftCreditsDb,
  params: {
    userId: string;
    appliedCents: number;
    allocations?: GiftCreditAllocation[] | null;
    orderId?: string | null;
  },
): Promise<void> {
  if (params.appliedCents <= 0) {
    return;
  }

  const allocations = params.allocations;
  if (
    allocations === null ||
    allocations === undefined ||
    allocations.length === 0
  ) {
    await db.user.update({
      where: { id: params.userId },
      data: { giftCreditsCents: { increment: params.appliedCents } },
    });
    return;
  }

  for (const allocation of allocations) {
    if (allocation.cents <= 0) {
      continue;
    }
    if (allocation.cardId === null) {
      await db.user.update({
        where: { id: params.userId },
        data: { giftCreditsCents: { increment: allocation.cents } },
      });
      continue;
    }
    const card = await db.giftCard.findUnique({
      where: { id: allocation.cardId },
      select: { id: true, code: true, balanceAmd: true, status: true },
    });
    if (card === null) {
      await db.user.update({
        where: { id: params.userId },
        data: { giftCreditsCents: { increment: allocation.cents } },
      });
      continue;
    }
    await creditGiftCardAmd(db, {
      cardId: card.id,
      cents: allocation.cents,
      userId: params.userId,
      code: card.code,
      reactivate: card.status === GiftCardStatus.REDEEMED,
      orderId: params.orderId,
    });
  }
}

export { cardIdsFromAllocations };

/** Metadata fragment for package payments that applied gift credits. */
export function buildGiftCreditsPaymentMetadata(
  appliedCents: number,
  allocations: GiftCreditAllocation[],
): Record<string, unknown> {
  if (appliedCents <= 0) {
    return {};
  }
  return {
    [PACKAGE_GIFT_CREDITS_APPLIED_KEY]: appliedCents,
    [PACKAGE_GIFT_CREDITS_ALLOCATIONS_KEY]: allocations,
  };
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

export {
  readGiftCreditsAllocations,
  readGiftCreditsAppliedCents,
  wereGiftCreditsRefunded,
} from './package-gift-credits.metadata';
