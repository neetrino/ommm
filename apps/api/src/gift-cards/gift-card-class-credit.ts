import {
  GiftCardStatus,
  GiftCardTransactionKind,
  GiftCardType,
  type Prisma,
} from '@prisma/client';
import type { GiftLedgerDb } from './gift-card-ledger';
import { compareGiftCardsForSpend, GIFT_CARD_DEBIT_ATTEMPTS } from './gift-card-policy';

export type ClassCreditTake = {
  cardId: string;
  classes: number;
  transactionId: string;
};

/**
 * Spends fixed-class credits for the matching class type.
 * A card with allowOtherClasses can cover a different class. Partial use keeps the remainder.
 */
export async function reserveGiftClassSessions(
  db: GiftLedgerDb,
  params: { userId: string; classTypeId: string; sessions: number; orderId?: string | null },
): Promise<ClassCreditTake[]> {
  if (params.sessions <= 0) {
    return [];
  }
  const cards = await db.giftCard.findMany({
    where: activeClassCardsWhere(params.userId, params.classTypeId, new Date()),
  });
  cards.sort(compareGiftCardsForSpend);
  return takeClassSessions(db, cards, params);
}

async function takeClassSessions(
  db: GiftLedgerDb,
  cards: Array<{ id: string; balanceClasses: number; code: string }>,
  params: { userId: string; sessions: number; orderId?: string | null },
): Promise<ClassCreditTake[]> {
  let remaining = params.sessions;
  const takes: ClassCreditTake[] = [];
  for (const card of cards) {
    if (remaining <= 0) {
      break;
    }
    const taken = await debitClassCard(db, card, remaining, params);
    if (taken === null) {
      continue;
    }
    takes.push(taken);
    remaining -= taken.classes;
  }
  return takes;
}

async function debitClassCard(
  db: GiftLedgerDb,
  card: { id: string; balanceClasses: number; code: string },
  want: number,
  params: { userId: string; orderId?: string | null },
): Promise<ClassCreditTake | null> {
  const take = Math.min(card.balanceClasses, want);
  if (take <= 0) {
    return null;
  }
  const updated = await db.giftCard.updateMany({
    where: {
      id: card.id,
      status: GiftCardStatus.ACTIVE,
      type: GiftCardType.FIXED_CLASS,
      balanceClasses: { gte: take },
    },
    data: {
      balanceClasses: { decrement: take },
      ...(card.balanceClasses === take ? { status: GiftCardStatus.REDEEMED } : {}),
    },
  });
  if (updated.count !== 1) {
    return retryClassDebit(db, card.id, want, params);
  }
  return writeClassSpend(db, card, take, params);
}

async function retryClassDebit(
  db: GiftLedgerDb,
  cardId: string,
  want: number,
  params: { userId: string; orderId?: string | null },
): Promise<ClassCreditTake | null> {
  for (let attempt = 1; attempt < GIFT_CARD_DEBIT_ATTEMPTS; attempt += 1) {
    const fresh = await db.giftCard.findUnique({
      where: { id: cardId },
      select: { id: true, code: true, balanceClasses: true, status: true },
    });
    if (fresh === null || fresh.status !== GiftCardStatus.ACTIVE) {
      return null;
    }
    const take = Math.min(fresh.balanceClasses, want);
    if (take <= 0) {
      return null;
    }
    const updated = await db.giftCard.updateMany({
      where: {
        id: cardId,
        status: GiftCardStatus.ACTIVE,
        balanceClasses: { gte: take },
      },
      data: {
        balanceClasses: { decrement: take },
        ...(fresh.balanceClasses === take ? { status: GiftCardStatus.REDEEMED } : {}),
      },
    });
    if (updated.count === 1) {
      return writeClassSpend(db, fresh, take, params);
    }
  }
  return null;
}

function writeClassSpend(
  db: GiftLedgerDb,
  card: { id: string; balanceClasses: number },
  take: number,
  params: { userId: string; orderId?: string | null },
) {
  return db.giftCardTransaction
    .create({
      data: {
        giftCardId: card.id,
        kind: GiftCardTransactionKind.SPEND,
        userId: params.userId,
        orderId: params.orderId ?? null,
        amountAmd: 0,
        classes: take,
        balanceAmdAfter: 0,
        balanceClassesAfter: card.balanceClasses - take,
      },
      select: { id: true },
    })
    .then((row) => ({ cardId: card.id, classes: take, transactionId: row.id }));
}

export type ClassGiftDb = Pick<Prisma.TransactionClient, 'giftCard' | 'giftCardTransaction'>;

export async function peekGiftClassSessions(
  db: Pick<Prisma.TransactionClient, 'giftCard'>,
  params: { userId: string; classTypeId: string },
): Promise<number> {
  const rows = await db.giftCard.findMany({
    where: activeClassCardsWhere(params.userId, params.classTypeId, new Date()),
    select: { balanceClasses: true },
  });
  return rows.reduce((sum, row) => sum + row.balanceClasses, 0);
}

/** Puts class sessions back when the booking that spent them is cancelled. */
export async function restoreGiftClassSpend(db: ClassGiftDb, orderId: string): Promise<void> {
  const spends = await db.giftCardTransaction.findMany({
    where: { orderId, kind: GiftCardTransactionKind.SPEND, classes: { gt: 0 } },
    select: { giftCardId: true, classes: true, userId: true },
  });
  for (const spend of spends) {
    await restoreOneClassSpend(db, spend, orderId);
  }
}

async function restoreOneClassSpend(
  db: ClassGiftDb,
  spend: { giftCardId: string; classes: number; userId: string | null },
  orderId: string,
): Promise<void> {
  const refunded = await db.giftCardTransaction.findFirst({
    where: { orderId, giftCardId: spend.giftCardId, kind: GiftCardTransactionKind.REFUND },
    select: { id: true },
  });
  if (refunded !== null) {
    return;
  }
  const card = await db.giftCard.update({
    where: { id: spend.giftCardId },
    data: {
      balanceClasses: { increment: spend.classes },
      status: GiftCardStatus.ACTIVE,
    },
    select: { balanceClasses: true, balanceAmd: true },
  });
  await db.giftCardTransaction.create({
    data: {
      giftCardId: spend.giftCardId,
      kind: GiftCardTransactionKind.REFUND,
      userId: spend.userId,
      orderId,
      classes: spend.classes,
      balanceAmdAfter: card.balanceAmd,
      balanceClassesAfter: card.balanceClasses,
    },
  });
}

function activeClassCardsWhere(userId: string, classTypeId: string, now: Date) {
  return {
    recipientId: userId,
    status: GiftCardStatus.ACTIVE,
    type: GiftCardType.FIXED_CLASS,
    balanceClasses: { gt: 0 as const },
    AND: [
      { OR: [{ classTypeId }, { allowOtherClasses: true }] },
      { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
    ],
  };
}
