import { GiftCardStatus, GiftCardType } from '@prisma/client';
import { reserveGiftClassSessions } from './gift-card-class-credit';

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

    expect(takes).toEqual([{ cardId: 'reformer', classes: 1, transactionId: 'tx-class' }]);
    expect(db.giftCard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          type: GiftCardType.FIXED_CLASS,
          classTypeId: 'reformer-group',
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
      giftCard: { findMany: jest.fn().mockResolvedValue([]), updateMany: jest.fn() },
      giftCardTransaction: { create: jest.fn() },
    };
    await reserveGiftClassSessions(db as never, {
      userId: 'u1',
      classTypeId: 'mat',
      sessions: 1,
    });
    expect(db.giftCard.updateMany).not.toHaveBeenCalled();
    expect(db.giftCard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ classTypeId: 'mat' }),
      }),
    );
  });
});
