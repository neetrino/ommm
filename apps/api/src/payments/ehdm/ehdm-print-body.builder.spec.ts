import { ManualPaymentMethod } from '@prisma/client';
import { EHDM_PRINT_MODE } from './ehdm.constants';
import type { EhdmConfig } from './ehdm.config';
import {
  buildEhdmPrintBody,
  resolveEhdmItemCode,
  resolveEhdmItemName,
  toAmdMajorUnits,
} from './ehdm-print-body.builder';

function stubConfig(): EhdmConfig {
  return {
    getCrn: () => '52000000',
    getCashierId: () => 1,
    getDep: () => 3,
    getDefaultAdgCode: () => '9205',
    getDefaultUnit: () => 'Հատ',
  } as unknown as EhdmConfig;
}

describe('ehdm-print-body.builder', () => {
  it('builds a mode-2 sale body without dividing AMD amounts', () => {
    const body = buildEhdmPrintBody(stubConfig(), {
      paymentId: 'pay_abcdefghijklmnopqrstuv',
      paymentReference: 'PKG-123',
      amountCents: 25_000,
      paymentMethod: ManualPaymentMethod.CARD,
      itemName: 'Unlimited yoga package with extra words',
      itemCode: 'PKG-123',
      seq: 2,
    });

    expect(body.mode).toBe(EHDM_PRINT_MODE.SALE_WITH_ITEMS);
    expect(body.cardAmount).toBe(25_000);
    expect(body.cashAmount).toBe(0);
    expect(body.partialAmount).toBe(0);
    expect(body.prePaymentAmount).toBe(0);
    expect(body.partnerTin).toBeNull();
    expect(body.items).toHaveLength(1);
    expect(body.items[0]?.price).toBe(25_000);
    expect(body.items[0]?.goodName).toHaveLength(30);
    expect(body.items[0]?.goodCode).toBe('PKG-123');
  });

  it('uses cash tender for bank transfer', () => {
    const body = buildEhdmPrintBody(stubConfig(), {
      paymentId: 'pay_1',
      paymentReference: null,
      amountCents: 8_000,
      paymentMethod: ManualPaymentMethod.BANK_TRANSFER,
      itemName: 'Drop-in',
      itemCode: 'pay_1',
      seq: 3,
    });
    expect(body.cashAmount).toBe(8_000);
    expect(body.cardAmount).toBe(0);
  });

  it('keeps amountCents as AMD major units', () => {
    expect(toAmdMajorUnits(40_000)).toBe(40_000);
  });

  it('resolves item name and code fallbacks', () => {
    expect(resolveEhdmItemName('Package A', 'ignored')).toBe('Package A');
    expect(resolveEhdmItemName(null, 'Gift card')).toBe('Gift card');
    expect(resolveEhdmItemName(null, null)).toBe('Վճարում');
    expect(resolveEhdmItemCode('REF-9', 'abcdefghijklmno')).toBe('REF-9');
    expect(resolveEhdmItemCode(null, 'abcdefghijklmno')).toBe('defghijklmno');
  });
});
