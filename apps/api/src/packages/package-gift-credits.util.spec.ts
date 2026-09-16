import { BadRequestException } from '@nestjs/common';
import { GiftCardStatus } from '@prisma/client';
import {
  peekSpendableGiftCreditsCents,
  readGiftCreditsAllocations,
  refundReservedGiftCredits,
  reserveGiftCreditsForPackage,
} from './package-gift-credits.util';

describe('package-gift-credits.util', () => {
  it('peekSpendableGiftCreditsCents sums wallet and active cards', async () => {
    const db = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ giftCreditsCents: 1_000 }),
      },
      giftCard: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'c1', balanceAmd: 2_000 },
          { id: 'c2', balanceAmd: 500 },
        ]),
      },
    };

    await expect(
      peekSpendableGiftCreditsCents(db as never, 'u1'),
    ).resolves.toBe(3_500);
  });

  it('reserveGiftCreditsForPackage debits nearest-expiry cards before wallet', async () => {
    const updates: Array<{ id: string; data: Record<string, unknown> }> = [];
    const db = {
      giftCard: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'soon', balanceAmd: 3_000, expiresAt: new Date('2026-01-01') },
          { id: 'later', balanceAmd: 5_000, expiresAt: new Date('2026-06-01') },
        ]),
        update: jest
          .fn()
          .mockImplementation(
            (args: {
              where: { id: string };
              data: Record<string, unknown>;
            }) => {
              updates.push({ id: args.where.id, data: args.data });
              return Promise.resolve({});
            },
          ),
      },
      user: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    const allocations = await reserveGiftCreditsForPackage(db as never, {
      userId: 'u1',
      appliedCents: 4_500,
    });

    expect(allocations).toEqual([
      { cardId: 'soon', cents: 3_000 },
      { cardId: 'later', cents: 1_500 },
    ]);
    expect(updates).toEqual([
      {
        id: 'soon',
        data: { balanceAmd: 0, status: GiftCardStatus.REDEEMED },
      },
      { id: 'later', data: { balanceAmd: 3_500 } },
    ]);
    expect(db.user.updateMany).not.toHaveBeenCalled();
  });

  it('reserveGiftCreditsForPackage uses legacy wallet after cards', async () => {
    const db = {
      giftCard: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            { id: 'c1', balanceAmd: 1_000, expiresAt: null },
          ]),
        update: jest.fn().mockResolvedValue({}),
      },
      user: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    const allocations = await reserveGiftCreditsForPackage(db as never, {
      userId: 'u1',
      appliedCents: 2_500,
    });

    expect(allocations).toEqual([
      { cardId: 'c1', cents: 1_000 },
      { cardId: null, cents: 1_500 },
    ]);
    expect(db.user.updateMany).toHaveBeenCalledWith({
      where: { id: 'u1', giftCreditsCents: { gte: 1_500 } },
      data: { giftCreditsCents: { decrement: 1_500 } },
    });
  });

  it('reserveGiftCreditsForPackage throws when balance is insufficient', async () => {
    const db = {
      giftCard: {
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn(),
      },
      user: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };

    await expect(
      reserveGiftCreditsForPackage(db as never, {
        userId: 'u1',
        appliedCents: 100,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('refundReservedGiftCredits restores card balances and reactivates redeemed', async () => {
    const db = {
      giftCard: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce({
            id: 'c1',
            balanceAmd: 0,
            status: GiftCardStatus.REDEEMED,
          })
          .mockResolvedValueOnce({
            id: 'c2',
            balanceAmd: 500,
            status: GiftCardStatus.ACTIVE,
          }),
        update: jest.fn().mockResolvedValue({}),
      },
      user: {
        update: jest.fn().mockResolvedValue({}),
      },
    };

    await refundReservedGiftCredits(db as never, {
      userId: 'u1',
      appliedCents: 2_200,
      allocations: [
        { cardId: 'c1', cents: 1_000 },
        { cardId: 'c2', cents: 700 },
        { cardId: null, cents: 500 },
      ],
    });

    expect(db.giftCard.update).toHaveBeenNthCalledWith(1, {
      where: { id: 'c1' },
      data: { balanceAmd: 1_000, status: GiftCardStatus.ACTIVE },
    });
    expect(db.giftCard.update).toHaveBeenNthCalledWith(2, {
      where: { id: 'c2' },
      data: { balanceAmd: 1_200, status: GiftCardStatus.ACTIVE },
    });
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { giftCreditsCents: { increment: 500 } },
    });
  });

  it('readGiftCreditsAllocations parses payment metadata', () => {
    expect(
      readGiftCreditsAllocations({
        giftCreditsAllocations: [
          { cardId: 'c1', cents: 100 },
          { cardId: null, cents: 50 },
          { cardId: 'bad', cents: 0 },
        ],
      }),
    ).toEqual([
      { cardId: 'c1', cents: 100 },
      { cardId: null, cents: 50 },
    ]);
  });
});
