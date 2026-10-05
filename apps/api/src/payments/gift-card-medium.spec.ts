import 'reflect-metadata';
import { parsePaymentMetadata } from './payments.helpers';
import {
  PHYSICAL_GIFT_CARD_FEE_AMD,
  giftCheckoutChargeAmd,
  normalizeGiftCardMedium,
  purchasedGiftFaceAmd,
} from './gift-card-medium';

describe('gift card medium', () => {
  it('adds 3000 AMD only for a physical card', () => {
    expect(giftCheckoutChargeAmd(30_000, 'DIGITAL')).toEqual({
      chargeAmd: 30_000,
      feeAmd: 0,
    });
    expect(giftCheckoutChargeAmd(30_000, 'PHYSICAL')).toEqual({
      chargeAmd: 33_000,
      feeAmd: PHYSICAL_GIFT_CARD_FEE_AMD,
    });
  });

  it('treats unknown formats as digital', () => {
    expect(normalizeGiftCardMedium(undefined)).toBe('DIGITAL');
    expect(normalizeGiftCardMedium('PRINT')).toBe('DIGITAL');
    expect(normalizeGiftCardMedium('PHYSICAL')).toBe('PHYSICAL');
  });

  it('keeps the gift face value when the charge includes the print fee', () => {
    expect(
      purchasedGiftFaceAmd({ chargedAmd: 33_000, giftFaceAmd: 30_000 }),
    ).toBe(30_000);
    expect(purchasedGiftFaceAmd({ chargedAmd: 33_000 })).toBe(33_000);
    expect(
      purchasedGiftFaceAmd({
        chargedAmd: 33_000,
        giftFaceAmd: 30_000,
        batchAmountAmd: 20_000,
      }),
    ).toBe(20_000);
  });

  it('reads format and face value back from payment metadata', () => {
    expect(
      parsePaymentMetadata({
        format: 'PHYSICAL',
        giftFaceAmd: 30_000,
        physicalFeeAmd: PHYSICAL_GIFT_CARD_FEE_AMD,
        delivery: 'EMAIL',
      }),
    ).toMatchObject({
      format: 'PHYSICAL',
      giftFaceAmd: 30_000,
      physicalFeeAmd: PHYSICAL_GIFT_CARD_FEE_AMD,
      delivery: 'EMAIL',
    });
  });
});
