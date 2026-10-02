import { GiftCardStatus, GiftCardType } from '@prisma/client';
import {
  buildMintedGiftCardRows,
  claimPreissuedGiftCard,
  parseGiftExpiresAt,
  resolveIssuedExpiresAt,
} from './gift-card-issue';

describe('gift-card-issue', () => {
  it('mints one unique code per card and does not activate them', () => {
    const rows = buildMintedGiftCardRows({
      batchId: 'batch-1',
      quantity: 3,
      amountAmd: 40_000,
      balanceClasses: 0,
      classQuantity: 0,
      classTypeId: null,
      type: GiftCardType.FIXED_VALUE,
      imageUrl: null,
      message: null,
      recipientEmail: null,
      recipientName: null,
      expiresAt: new Date('2027-09-28T00:00:00.000Z'),
    });
    const codes = new Set(rows.map((row) => row.code));
    expect(rows).toHaveLength(3);
    expect(codes.size).toBe(3);
    expect(rows.every((row) => /^[0-9A-F]{8}$/.test(String(row.code)))).toBe(true);
    expect(rows.every((row) => row.recipientId === undefined)).toBe(true);
    expect(rows.every((row) => row.status === GiftCardStatus.ACTIVE)).toBe(true);
  });

  it('defaults expiry to twelve months', () => {
    const expiresAt = resolveIssuedExpiresAt(undefined, new Date('2026-09-28T00:00:00.000Z'));
    expect(expiresAt.toISOString()).toBe('2027-09-28T00:00:00.000Z');
  });

  it('claims one unassigned code and leaves it unredeemed', async () => {
    const updateMany = jest.fn().mockResolvedValue({ count: 1 });
    const tx = {
      giftCard: {
        findFirst: jest.fn().mockResolvedValue({ id: 'card-1', code: 'CODE1' }),
        updateMany,
      },
    };
    const claimed = await claimPreissuedGiftCard(tx as never, {
      batchId: 'batch-1',
      purchaserId: 'buyer',
      recipientEmail: 'a@example.com',
    });
    expect(claimed).toEqual({ code: 'CODE1' });
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 'card-1', purchaserId: null, recipientId: null },
      data: {
        purchaserId: 'buyer',
        recipientEmail: 'a@example.com',
        recipientName: undefined,
        message: undefined,
      },
    });
  });

  it('reads an explicit expiration date', () => {
    const expiresAt = parseGiftExpiresAt('2027-02-10');
    expect(expiresAt?.toISOString()).toBe('2027-02-10T12:00:00.000Z');
    expect(parseGiftExpiresAt('')).toBeUndefined();
  });
});
