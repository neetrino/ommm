import { ManualPaymentMethod } from '@prisma/client';
import { EHDM_RETURN_PRODUCT_ID } from './ehdm.constants';
import type { EhdmConfig } from './ehdm.config';
import { buildEhdmReturnBody } from './ehdm-return-body.builder';

function stubConfig(): EhdmConfig {
  return {
    getCrn: () => '52000000',
  } as unknown as EhdmConfig;
}

describe('ehdm-return-body.builder', () => {
  it('matches original card tender and uses receiptProductId 0', () => {
    const body = buildEhdmReturnBody(stubConfig(), {
      receiptId: '8',
      amountCents: 22_000,
      paymentMethod: ManualPaymentMethod.CARD,
      seq: 6,
    });

    expect(body.receiptId).toBe(8);
    expect(body.seq).toBe(6);
    expect(body.cardAmountForReturn).toBe(22_000);
    expect(body.cashAmountForReturn).toBe(0);
    expect(body.returnItemList).toEqual([
      { receiptProductId: EHDM_RETURN_PRODUCT_ID, quantity: 1 },
    ]);
  });

  it('matches cash tender for manual payments', () => {
    const body = buildEhdmReturnBody(stubConfig(), {
      receiptId: '12',
      amountCents: 9_000,
      paymentMethod: ManualPaymentMethod.CASH,
      seq: 7,
    });
    expect(body.cardAmountForReturn).toBe(0);
    expect(body.cashAmountForReturn).toBe(9_000);
  });
});
