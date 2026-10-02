import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  GiftCardStatus,
  GiftCardTransactionKind,
  type Prisma,
} from '@prisma/client';
import { readGiftCardBalance } from './gift-cards.mapper';

export type GiftRedeemDb = Pick<
  Prisma.TransactionClient,
  'giftCard' | 'giftCardTransaction'
>;

export type GiftRedeemResult = {
  ok: true;
  creditedCents: number;
  creditedClasses: number;
  alreadyOwned: boolean;
};

/** Binds a code to one account. A second concurrent redeem cannot win. */
export async function redeemGiftCardForUser(
  db: GiftRedeemDb,
  userId: string,
  code: string,
  now = new Date(),
): Promise<GiftRedeemResult> {
  const card = await db.giftCard.findUnique({
    where: { code: normalizeGiftCode(code) },
  });
  if (card === null) {
    throw new NotFoundException('Invalid code');
  }
  if (card.expiresAt !== null && card.expiresAt <= now) {
    await markExpired(db, card.id, now);
    throw new BadRequestException('Gift card has expired');
  }
  if (card.status !== GiftCardStatus.ACTIVE) {
    throw new NotFoundException('Invalid code');
  }
  const creditedCents = readGiftCardBalance(card);
  const creditedClasses = card.balanceClasses;
  if (creditedCents <= 0 && creditedClasses <= 0) {
    throw new BadRequestException('Gift card has no balance');
  }
  if (card.recipientId === userId) {
    return { ok: true, creditedCents, creditedClasses, alreadyOwned: true };
  }
  if (card.recipientId !== null) {
    throw new BadRequestException('Gift card already assigned');
  }
  return claimUnassignedCard(
    db,
    card,
    userId,
    now,
    creditedCents,
    creditedClasses,
  );
}

export function normalizeGiftCode(code: string): string {
  return code.trim().toUpperCase();
}

async function claimUnassignedCard(
  db: GiftRedeemDb,
  card: { id: string; balanceClasses: number },
  userId: string,
  now: Date,
  creditedCents: number,
  creditedClasses: number,
): Promise<GiftRedeemResult> {
  const claimed = await db.giftCard.updateMany({
    where: { id: card.id, status: GiftCardStatus.ACTIVE, recipientId: null },
    data: { recipientId: userId, redeemedAt: now },
  });
  if (claimed.count !== 1) {
    return rereadRedeem(db, card.id, userId, creditedCents, creditedClasses);
  }
  await db.giftCardTransaction.create({
    data: {
      giftCardId: card.id,
      kind: GiftCardTransactionKind.REDEEM,
      userId,
      amountAmd: creditedCents,
      classes: creditedClasses,
      balanceAmdAfter: creditedCents,
      balanceClassesAfter: card.balanceClasses,
    },
  });
  return { ok: true, creditedCents, creditedClasses, alreadyOwned: false };
}

async function rereadRedeem(
  db: GiftRedeemDb,
  cardId: string,
  userId: string,
  creditedCents: number,
  creditedClasses: number,
): Promise<GiftRedeemResult> {
  const current = await db.giftCard.findUnique({
    where: { id: cardId },
    select: { recipientId: true },
  });
  if (current?.recipientId === userId) {
    return { ok: true, creditedCents, creditedClasses, alreadyOwned: true };
  }
  throw new BadRequestException('Gift card already assigned');
}

async function markExpired(
  db: GiftRedeemDb,
  cardId: string,
  now: Date,
): Promise<void> {
  await db.giftCard.updateMany({
    where: {
      id: cardId,
      status: GiftCardStatus.ACTIVE,
      expiresAt: { lte: now },
    },
    data: { status: GiftCardStatus.EXPIRED },
  });
}
