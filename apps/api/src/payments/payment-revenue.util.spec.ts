import { ManualPaymentMethod, PaymentStatus } from '@prisma/client';
import {
  INFLUENCER_PAYMENT_METHOD,
  isInfluencerPaymentMethod,
  isRevenueSucceededPayment,
  summarizeInfluencerCost,
  toManualPaymentMethod,
} from './payment-revenue.util';

describe('payment-revenue.util', () => {
  it('maps admin grant methods onto the Prisma enum', () => {
    expect(toManualPaymentMethod('INFLUENCER')).toBe(INFLUENCER_PAYMENT_METHOD);
    expect(toManualPaymentMethod('CASH')).toBe(ManualPaymentMethod.CASH);
  });

  it('treats only INFLUENCER as a comp method', () => {
    expect(isInfluencerPaymentMethod(INFLUENCER_PAYMENT_METHOD)).toBe(true);
    expect(isInfluencerPaymentMethod(ManualPaymentMethod.CASH)).toBe(false);
    expect(isInfluencerPaymentMethod(null)).toBe(false);
  });

  it('counts succeeded non-influencer payments as cash revenue', () => {
    expect(
      isRevenueSucceededPayment({
        status: PaymentStatus.SUCCEEDED,
        paymentMethod: ManualPaymentMethod.CASH,
      }),
    ).toBe(true);
    expect(
      isRevenueSucceededPayment({
        status: PaymentStatus.SUCCEEDED,
        paymentMethod: INFLUENCER_PAYMENT_METHOD,
      }),
    ).toBe(false);
    expect(
      isRevenueSucceededPayment({
        status: PaymentStatus.PENDING,
        paymentMethod: ManualPaymentMethod.CASH,
      }),
    ).toBe(false);
  });

  it('sums influencer catalog cost separately from cash revenue', () => {
    const result = summarizeInfluencerCost([
      {
        status: PaymentStatus.SUCCEEDED,
        paymentMethod: ManualPaymentMethod.CASH,
        amountCents: 10_000,
      },
      {
        status: PaymentStatus.SUCCEEDED,
        paymentMethod: INFLUENCER_PAYMENT_METHOD,
        amountCents: 12_000,
      },
      {
        status: PaymentStatus.SUCCEEDED,
        paymentMethod: INFLUENCER_PAYMENT_METHOD,
        amountCents: 8_000,
      },
    ]);
    expect(result).toEqual({ count: 2, costCents: 20_000 });
  });
});
