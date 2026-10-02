import {
  compareGiftCardsForSpend,
  defaultGiftCardExpiresAt,
  resolveGiftCardPolicy,
} from './gift-card-policy';

describe('gift-card-policy', () => {
  it('adds twelve months in UTC when no expiry is chosen', () => {
    const from = new Date('2026-01-31T00:00:00.000Z');
    expect(defaultGiftCardExpiresAt(from).toISOString()).toBe(
      '2027-01-31T00:00:00.000Z',
    );
  });

  it('spends the soonest expiry first and undated cards last', () => {
    const undated = {
      id: 'open',
      expiresAt: null,
      createdAt: new Date('2020-01-01'),
    };
    const soon = {
      id: 'soon',
      expiresAt: new Date('2026-02-01'),
      createdAt: new Date('2026-01-01'),
    };
    const later = {
      id: 'later',
      expiresAt: new Date('2026-08-01'),
      createdAt: new Date('2025-01-01'),
    };
    const ordered = [undated, later, soon].sort(compareGiftCardsForSpend);
    expect(ordered.map((card) => card.id)).toEqual(['soon', 'later', 'open']);
  });

  it('reads studio limits and drops denominations below the minimum', () => {
    const policy = resolveGiftCardPolicy({
      giftCardMinAmountAmd: 40_000,
      giftCardValidityMonths: 18,
      giftCardDenominationsJson: '[10000,40000,70000]',
    });
    expect(policy).toEqual({
      minAmountAmd: 40_000,
      maxAmountAmd: 1_000_000,
      denominationsAmd: [40_000, 70_000],
      validityMonths: 18,
    });
  });

  it('falls back when denominations JSON is invalid', () => {
    const policy = resolveGiftCardPolicy({
      giftCardMinAmountAmd: 30_000,
      giftCardValidityMonths: 12,
      giftCardDenominationsJson: 'not-json',
    });
    expect(policy.denominationsAmd).toEqual([40_000, 70_000, 100_000]);
  });
});
