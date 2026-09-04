import { ManualPaymentMethod } from '@prisma/client';
import { isEhdmCardTender, resolveEhdmTenderSplit } from './ehdm-tender.util';

describe('ehdm-tender.util', () => {
  it('treats CARD and CARD_TERMINAL as card tender', () => {
    expect(isEhdmCardTender(ManualPaymentMethod.CARD)).toBe(true);
    expect(isEhdmCardTender(ManualPaymentMethod.CARD_TERMINAL)).toBe(true);
    expect(isEhdmCardTender(ManualPaymentMethod.CASH)).toBe(false);
    expect(isEhdmCardTender(null)).toBe(false);
  });

  it('puts the full AMD amount on card for card tenders', () => {
    expect(resolveEhdmTenderSplit(40_000, ManualPaymentMethod.CARD)).toEqual({
      cardAmount: 40_000,
      cashAmount: 0,
    });
    expect(
      resolveEhdmTenderSplit(12_000, ManualPaymentMethod.CARD_TERMINAL),
    ).toEqual({
      cardAmount: 12_000,
      cashAmount: 0,
    });
  });

  it('puts the full AMD amount on cash for manual tenders', () => {
    expect(resolveEhdmTenderSplit(25_000, ManualPaymentMethod.CASH)).toEqual({
      cardAmount: 0,
      cashAmount: 25_000,
    });
    expect(
      resolveEhdmTenderSplit(8_000, ManualPaymentMethod.BANK_TRANSFER),
    ).toEqual({
      cardAmount: 0,
      cashAmount: 8_000,
    });
    expect(resolveEhdmTenderSplit(5_000, null)).toEqual({
      cardAmount: 0,
      cashAmount: 5_000,
    });
  });
});
