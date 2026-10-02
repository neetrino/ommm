import {
  GiftCardStatus,
  GiftCardTransactionKind,
  GiftCardType,
} from '@prisma/client';
import {
  reserveGiftClassSessions,
  restoreGiftClassSpend,
} from './gift-card-class-credit';

function containing(
  expected: Record<string, unknown>,
): Record<string, unknown> {
  return expect.objectContaining(expected) as Record<string, unknown>;
}

function containingItems(expected: readonly unknown[]): unknown[] {
  return expect.arrayContaining(expected) as unknown[];
}

describe('reserveGiftClassSessions', () => {
  it('spends only the matching class and keeps the remainder', async () => {
    const db = {
      giftCard: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'reformer',
            code: 'R1',
            balanceClasses: 3,
            expiresAt: new Date('2026-12-01'),
            createdAt: new Date('2026-01-01'),
          },
        ]),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      giftCardTransaction: {
        create: jest.fn().mockResolvedValue({ id: 'tx-class' }),
      },
    };

    const takes = await reserveGiftClassSessions(db as never, {
      userId: 'u1',
      classTypeId: 'reformer-group',
      sessions: 1,
    });

    expect(takes).toEqual([
      { cardId: 'reformer', classes: 1, transactionId: 'tx-class' },
    ]);
    expect(db.giftCard.findMany).toHaveBeenCalledWith(
      containing({
        where: containing({
          type: GiftCardType.FIXED_CLASS,
          AND: containingItems([
            {
              OR: [
                { classTypeId: 'reformer-group' },
                { allowOtherClasses: true },
              ],
            },
          ]),
        }),
      }),
    );
    expect(db.giftCard.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'reformer',
        status: GiftCardStatus.ACTIVE,
        type: GiftCardType.FIXED_CLASS,
        balanceClasses: { gte: 1 },
      },
      data: { balanceClasses: { decrement: 1 } },
    });
  });

  it('does not query a different class type', async () => {
    const db = {
      giftCard: {
        findMany: jest.fn().mockResolvedValue([]),
        updateMany: jest.fn(),
      },
      giftCardTransaction: { create: jest.fn() },
    };
    await reserveGiftClassSessions(db as never, {
      userId: 'u1',
      classTypeId: 'mat',
      sessions: 1,
    });
    expect(db.giftCard.updateMany).not.toHaveBeenCalled();
    expect(db.giftCard.findMany).toHaveBeenCalledWith(
      containing({
        where: containing({
          AND: containingItems([
            { OR: [{ classTypeId: 'mat' }, { allowOtherClasses: true }] },
          ]),
        }),
      }),
    );
  });
});

describe('restoreGiftClassSpend', () => {
  it('returns the spent sessions once and writes a refund', async () => {
    const db = {
      giftCard: {
        update: jest
          .fn()
          .mockResolvedValue({ balanceClasses: 2, balanceAmd: 0 }),
      },
      giftCardTransaction: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            { giftCardId: 'reformer', classes: 1, userId: 'u1' },
          ]),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'refund-1' }),
      },
    };

    await restoreGiftClassSpend(db as never, 'booking-1');

    expect(db.giftCard.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'reformer' },
        data: {
          balanceClasses: { increment: 1 },
          status: GiftCardStatus.ACTIVE,
        },
      }),
    );
    expect(db.giftCardTransaction.create).toHaveBeenCalledWith(
      containing({
        data: containing({
          kind: GiftCardTransactionKind.REFUND,
          classes: 1,
          orderId: 'booking-1',
        }),
      }),
    );
  });
});
