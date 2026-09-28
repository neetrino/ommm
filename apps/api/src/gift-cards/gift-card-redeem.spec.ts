import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GiftCardStatus, GiftCardTransactionKind } from '@prisma/client';
import { redeemGiftCardForUser } from './gift-card-redeem';

describe('redeemGiftCardForUser', () => {
  const card = {
    id: 'card-1',
    code: 'AB12',
    status: GiftCardStatus.ACTIVE,
    expiresAt: new Date('2027-01-01T00:00:00.000Z'),
    balanceAmd: 40_000,
    balanceClasses: 0,
    recipientId: null,
  };

  function db(overrides: Record<string, unknown> = {}) {
    return {
      giftCard: {
        findUnique: jest.fn().mockResolvedValue(card),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        ...overrides,
      },
      giftCardTransaction: {
        create: jest.fn().mockResolvedValue({ id: 'tx' }),
      },
    };
  }

  it('binds the code once and writes a redeem row', async () => {
    const client = db();
    const result = await redeemGiftCardForUser(client as never, 'user-1', ' ab12 ');
    expect(result).toEqual({
      ok: true,
      creditedCents: 40_000,
      creditedClasses: 0,
      alreadyOwned: false,
    });
    expect(client.giftCard.updateMany).toHaveBeenCalledWith({
      where: { id: 'card-1', status: GiftCardStatus.ACTIVE, recipientId: null },
      data: { recipientId: 'user-1', redeemedAt: expect.any(Date) },
    });
    expect(client.giftCardTransaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        kind: GiftCardTransactionKind.REDEEM,
        userId: 'user-1',
        amountAmd: 40_000,
      }),
    });
  });

  it('does not bind a code another account already claimed', async () => {
    const client = db({
      findUnique: jest.fn().mockResolvedValue({ ...card, recipientId: 'other' }),
    });
    await expect(redeemGiftCardForUser(client as never, 'user-1', 'AB12')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(client.giftCard.updateMany).not.toHaveBeenCalled();
  });

  it('treats a lost race as already assigned', async () => {
    const client = db({
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      findUnique: jest
        .fn()
        .mockResolvedValueOnce(card)
        .mockResolvedValueOnce({ recipientId: 'other' }),
    });
    await expect(redeemGiftCardForUser(client as never, 'user-1', 'AB12')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects an unknown code', async () => {
    const client = db({ findUnique: jest.fn().mockResolvedValue(null) });
    await expect(redeemGiftCardForUser(client as never, 'user-1', 'NOPE')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
