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

export function isGiftCreditSpendDescription(
  description: string | null | undefined,
): boolean {
  return (
    typeof description === 'string' &&
    description.startsWith(GIFT_CREDIT_SPEND_PREFIX)
  );
}

export const PACKAGE_GIFT_CREDITS_ALLOCATIONS_KEY = 'giftCreditsAllocations';
export const PACKAGE_GIFT_CREDITS_REFUNDED_KEY = 'giftCreditsRefunded';

/** One debit from a gift card (`cardId`) or legacy wallet (`cardId: null`). */
export type GiftCreditAllocation = {
  cardId: string | null;
  cents: number;
};

type GiftCreditsDb = Pick<
  Prisma.TransactionClient,
  'user' | 'giftCard' | 'payment'
>;

const MAX_SPENDABLE_GIFT_CARDS = 50;

/** Sum of legacy wallet + ACTIVE received gift-card balances (read-only). */
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
      take: MAX_SPENDABLE_GIFT_CARDS,
    }),
  ]);
  const walletCents = Math.max(0, user?.giftCreditsCents ?? 0);
  const cardsCents = cards.reduce((sum, card) => {
    return sum + Math.max(0, readGiftCardBalance(card));
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

/**
 * Debits gift value nearest-expiry-first (cards keep identity).
 * Legacy `giftCreditsCents` is spent only after card balances.
 */
export async function reserveGiftCreditsForPackage(
  db: GiftCreditsDb,
  params: { userId: string; appliedCents: number },
): Promise<GiftCreditAllocation[]> {
  if (params.appliedCents <= 0) {
    return [];
  }

  const now = new Date();
  const cards = await db.giftCard.findMany({
    where: {
      recipientId: params.userId,
      status: GiftCardStatus.ACTIVE,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: [{ expiresAt: 'asc' }, { createdAt: 'asc' }],
    take: MAX_SPENDABLE_GIFT_CARDS,
  });

  let remaining = params.appliedCents;
  const allocations: GiftCreditAllocation[] = [];

  for (const card of cards) {
    if (remaining <= 0) {
      break;
    }
    const balance = readGiftCardBalance(card);
    if (balance <= 0) {
      continue;
    }
    const take = Math.min(balance, remaining);
    const nextBalance = balance - take;
    await db.giftCard.update({
      where: { id: card.id },
      data: {
        balanceAmd: nextBalance,
        ...(nextBalance === 0 ? { status: GiftCardStatus.REDEEMED } : {}),
      },
    });
    allocations.push({ cardId: card.id, cents: take });
    remaining -= take;
  }

  if (remaining > 0) {
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
    remaining = 0;
  }

  if (remaining > 0) {
    throw new BadRequestException('Insufficient gift card credit');
  }
  return allocations;
}

/** Restores card balances (and legacy wallet) from a prior reservation. */
export async function refundReservedGiftCredits(
  db: GiftCreditsDb,
  params: {
    userId: string;
    appliedCents: number;
    allocations?: GiftCreditAllocation[] | null;
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
      select: { id: true, balanceAmd: true, status: true },
    });
    if (card === null) {
      await db.user.update({
        where: { id: params.userId },
        data: { giftCreditsCents: { increment: allocation.cents } },
      });
      continue;
    }
    const nextBalance = readGiftCardBalance(card) + allocation.cents;
    await db.giftCard.update({
      where: { id: card.id },
      data: {
        balanceAmd: nextBalance,
        status:
          card.status === GiftCardStatus.REDEEMED
            ? GiftCardStatus.ACTIVE
            : card.status,
      },
    });
  }
}

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

export function readGiftCreditsAllocations(
  metadata: Prisma.JsonValue | Prisma.InputJsonValue | null | undefined,
): GiftCreditAllocation[] | null {
  if (
    metadata === null ||
    metadata === undefined ||
    typeof metadata !== 'object' ||
    Array.isArray(metadata)
  ) {
    return null;
  }
  const raw = (metadata as Record<string, unknown>)[
    PACKAGE_GIFT_CREDITS_ALLOCATIONS_KEY
  ];
  if (!Array.isArray(raw)) {
    return null;
  }
  const allocations: GiftCreditAllocation[] = [];
  for (const entry of raw) {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
      continue;
    }
    const row = entry as Record<string, unknown>;
    const cents =
      typeof row.cents === 'number' && Number.isFinite(row.cents)
        ? Math.floor(row.cents)
        : 0;
    if (cents <= 0) {
      continue;
    }
    const cardId =
      typeof row.cardId === 'string'
        ? row.cardId
        : row.cardId === null
          ? null
          : undefined;
    if (cardId === undefined) {
      continue;
    }
    allocations.push({ cardId, cents });
  }
  return allocations.length > 0 ? allocations : null;
}

export function wereGiftCreditsRefunded(
  metadata: Prisma.JsonValue | Prisma.InputJsonValue | null | undefined,
): boolean {
  if (
    metadata === null ||
    metadata === undefined ||
    typeof metadata !== 'object' ||
    Array.isArray(metadata)
  ) {
    return false;
  }
  return (
    (metadata as Record<string, unknown>)[PACKAGE_GIFT_CREDITS_REFUNDED_KEY] ===
    true
  );
}
