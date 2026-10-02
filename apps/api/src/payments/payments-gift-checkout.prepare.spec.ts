import { convertGiftBalances } from '../gift-cards/gift-card-convert';
import { planDropInGiftCharge } from './payments-dropin-gift';
import { decideGiftEmail } from './payments-gift-delivery';
import { normalizeDelivery } from './payments-gift-checkout.prepare';

describe('gift checkout extras', () => {
  it('prices a drop-in from gift credit before the bank charge', () => {
    expect(
      planDropInGiftCharge({
        priceCents: 15_000,
        spendableCents: 10_000,
        useGiftCredits: true,
      }),
    ).toEqual({ appliedCents: 10_000, chargeCents: 5_000 });
    expect(
      planDropInGiftCharge({
        priceCents: 15_000,
        spendableCents: 10_000,
        useGiftCredits: false,
      }).chargeCents,
    ).toBe(15_000);
  });

  it('skips email for WhatsApp and waits for a future date', () => {
    const now = new Date('2026-09-28T12:00:00.000Z');
    expect(normalizeDelivery('PRINT')).toBe('PRINT');
    expect(
      decideGiftEmail({
        delivery: 'WHATSAPP',
        recipientEmail: 'a@b.c',
        now,
      }),
    ).toBe('skip');
    expect(
      decideGiftEmail({
        delivery: 'EMAIL',
        recipientEmail: 'a@b.c',
        deliverAt: '2026-12-01T00:00:00.000Z',
        now,
      }),
    ).toBe('schedule');
  });

  it('converts class sessions at the drop-in price and keeps a money remainder', () => {
    expect(
      convertGiftBalances({
        direction: 'TO_MONEY',
        balanceAmd: 0,
        balanceClasses: 2,
        unitPriceAmd: 15_000,
      }),
    ).toEqual({ balanceAmd: 30_000, balanceClasses: 0 });
    expect(
      convertGiftBalances({
        direction: 'TO_CLASSES',
        balanceAmd: 40_000,
        balanceClasses: 0,
        unitPriceAmd: 15_000,
      }),
    ).toEqual({ balanceAmd: 10_000, balanceClasses: 2 });
  });
});
