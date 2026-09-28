import {
  GiftCardStatus,
  GiftCardTransactionKind,
  type Prisma,
} from '@prisma/client';
import { readGiftCardBalance } from './gift-cards.mapper';
import { GIFT_CARD_DEBIT_ATTEMPTS, GIFT_CARD_EXPIRE_BATCH } from './gift-card-policy';

export type GiftLedgerDb = Pick<
  Prisma.TransactionClient,
  'giftCard' | 'giftCardTransaction'
>;

export type GiftCardDebit = {
  taken: number;
  transactionId: string;
};

type DebitAttempt = GiftCardDebit | 'retry' | null;

/** Conditional decrement. A lost race retries against a fresh balance. */
export async function debitGiftCardAmd(
  db: GiftLedgerDb,
  params: {
    cardId: string;
    knownBalance: number;
    maxTake: number;
    userId: string;
    code: string;
    orderId?: string | null;
  },
): Promise<GiftCardDebit | null> {
  const first = await applyAmdDebit(db, params, params.knownBalance);
  if (first !== 'retry') {
    return first;
  }
  for (let attempt = 1; attempt < GIFT_CARD_DEBIT_ATTEMPTS; attempt += 1) {
    const fresh = await db.giftCard.findUnique({
      where: { id: params.cardId },
      select: { balanceAmd: true, status: true },
    });
    if (fresh === null || fresh.status !== GiftCardStatus.ACTIVE) {
      return null;
    }
    const next = await applyAmdDebit(db, params, readGiftCardBalance(fresh));
    if (next !== 'retry') {
      return next;
    }
  }
  return null;
}

/** Puts value back on a card and writes the reversing ledger row. */
export async function creditGiftCardAmd(
  db: GiftLedgerDb,
  params: {
    cardId: string;
    cents: number;
    userId: string;
    code: string;
    reactivate: boolean;
    orderId?: string | null;
  },
): Promise<void> {
  const updated = await db.giftCard.update({
    where: { id: params.cardId },
    data: {
      balanceAmd: { increment: params.cents },
      ...(params.reactivate ? { status: GiftCardStatus.ACTIVE } : {}),
    },
    select: { balanceAmd: true, balanceClasses: true, code: true },
  });
  await writeGiftLedger(db, {
    giftCardId: params.cardId,
    kind: GiftCardTransactionKind.REFUND,
    userId: params.userId,
    orderId: params.orderId ?? null,
    amountAmd: params.cents,
    classes: 0,
    balanceAmdAfter: readGiftCardBalance(updated),
    balanceClassesAfter: updated.balanceClasses,
  });
}

/** Flips due cards to EXPIRED and records the balance that broke. */
export async function expireDueGiftCards(db: GiftLedgerDb): Promise<number> {
  const now = new Date();
  const due = await db.giftCard.findMany({
    where: { status: GiftCardStatus.ACTIVE, expiresAt: { lte: now } },
    select: {
      id: true,
      code: true,
      balanceAmd: true,
      balanceClasses: true,
      recipientId: true,
      expiresAt: true,
    },
    take: GIFT_CARD_EXPIRE_BATCH,
  });
  let expired = 0;
  for (const card of due) {
    if (card.expiresAt === null || card.expiresAt > now) {
      continue;
    }
    expired += await expireOneCard(db, card, now);
  }
  return expired;
}

/** Stamps spend rows created in this checkout with the payment id. */
export async function stampGiftSpendOrder(
  db: GiftLedgerDb,
  params: { userId: string; orderId: string; cardIds: string[] },
): Promise<void> {
  if (params.cardIds.length === 0) {
    return;
  }
  await db.giftCardTransaction.updateMany({
    where: {
      userId: params.userId,
      orderId: null,
      kind: GiftCardTransactionKind.SPEND,
      giftCardId: { in: params.cardIds },
    },
    data: { orderId: params.orderId },
  });
}

export function cardIdsFromAllocations(
  allocations: Array<{ cardId: string | null }> | undefined,
): string[] {
  if (allocations === undefined) {
    return [];
  }
  return allocations
    .map((row) => row.cardId)
    .filter((cardId): cardId is string => cardId !== null);
}

async function applyAmdDebit(
  db: GiftLedgerDb,
  params: {
    cardId: string;
    maxTake: number;
    userId: string;
    code: string;
    orderId?: string | null;
  },
  balance: number,
): Promise<DebitAttempt> {
  if (balance <= 0 || params.maxTake <= 0) {
    return null;
  }
  const take = Math.min(balance, params.maxTake);
  const updated = await db.giftCard.updateMany({
    where: {
      id: params.cardId,
      status: GiftCardStatus.ACTIVE,
      balanceAmd: { gte: take },
    },
    data: {
      balanceAmd: { decrement: take },
      ...(balance === take ? { status: GiftCardStatus.REDEEMED } : {}),
    },
  });
  if (updated.count !== 1) {
    return 'retry';
  }
  const transaction = await writeGiftLedger(db, {
    giftCardId: params.cardId,
    kind: GiftCardTransactionKind.SPEND,
    userId: params.userId,
    orderId: params.orderId ?? null,
    amountAmd: take,
    classes: 0,
    balanceAmdAfter: balance - take,
    balanceClassesAfter: 0,
  });
  return { taken: take, transactionId: transaction.id };
}

async function expireOneCard(
  db: GiftLedgerDb,
  card: {
    id: string;
    code: string;
    balanceAmd: number;
    balanceClasses: number;
    recipientId: string | null;
  },
  now: Date,
): Promise<number> {
  const updated = await db.giftCard.updateMany({
    where: {
      id: card.id,
      status: GiftCardStatus.ACTIVE,
      expiresAt: { lte: now },
    },
    data: { status: GiftCardStatus.EXPIRED },
  });
  if (updated.count !== 1) {
    return 0;
  }
  await writeGiftLedger(db, {
    giftCardId: card.id,
    kind: GiftCardTransactionKind.EXPIRE,
    userId: card.recipientId,
    orderId: null,
    amountAmd: 0,
    classes: 0,
    balanceAmdAfter: readGiftCardBalance(card),
    balanceClassesAfter: card.balanceClasses,
  });
  return 1;
}

function writeGiftLedger(
  db: GiftLedgerDb,
  data: {
    giftCardId: string;
    kind: GiftCardTransactionKind;
    userId: string | null;
    orderId: string | null;
    amountAmd: number;
    classes: number;
    balanceAmdAfter: number;
    balanceClassesAfter: number;
  },
) {
  return db.giftCardTransaction.create({ data, select: { id: true } });
}
