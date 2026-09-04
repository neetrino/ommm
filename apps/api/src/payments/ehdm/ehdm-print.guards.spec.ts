import { ManualPaymentMethod, PaymentStatus } from '@prisma/client';
import {
  skipReasonForEhdmPrint,
  skipReasonForEhdmReturn,
} from './ehdm-print.guards';

describe('ehdm-print.guards', () => {
  const basePrint = {
    status: PaymentStatus.SUCCEEDED,
    currency: 'amd',
    amountCents: 10_000,
    paymentMethod: ManualPaymentMethod.CASH,
    ehdmReceipt: null,
  };

  it('skips non-succeeded, already receipted, non-AMD, zero, and influencer', () => {
    expect(
      skipReasonForEhdmPrint({ ...basePrint, status: PaymentStatus.PENDING }),
    ).toBe('payment is not SUCCEEDED');
    expect(
      skipReasonForEhdmPrint({
        ...basePrint,
        ehdmReceipt: { id: 'r1' },
      }),
    ).toBe('receipt already exists');
    expect(skipReasonForEhdmPrint({ ...basePrint, currency: 'usd' })).toBe(
      'currency is not AMD',
    );
    expect(skipReasonForEhdmPrint({ ...basePrint, amountCents: 0 })).toBe(
      'amount is not positive',
    );
    expect(
      skipReasonForEhdmPrint({
        ...basePrint,
        paymentMethod: ManualPaymentMethod.INFLUENCER,
      }),
    ).toBe('influencer payment');
    expect(skipReasonForEhdmPrint(basePrint)).toBeNull();
  });

  it('skips return when sale is missing, mock, or already returned', () => {
    expect(
      skipReasonForEhdmReturn({ currency: 'amd', ehdmReceipt: null }),
    ).toBe('sale receipt is missing');
    expect(
      skipReasonForEhdmReturn({
        currency: 'amd',
        ehdmReceipt: {
          receiptId: '1',
          returnReceiptId: null,
          isMock: true,
        },
      }),
    ).toBe('sale receipt is missing');
    expect(
      skipReasonForEhdmReturn({
        currency: 'amd',
        ehdmReceipt: {
          receiptId: '1',
          returnReceiptId: '9',
          isMock: false,
        },
      }),
    ).toBe('return receipt already exists');
    expect(
      skipReasonForEhdmReturn({
        currency: 'usd',
        ehdmReceipt: {
          receiptId: '1',
          returnReceiptId: null,
          isMock: false,
        },
      }),
    ).toBe('currency is not AMD');
    expect(
      skipReasonForEhdmReturn({
        currency: 'amd',
        ehdmReceipt: {
          receiptId: '1',
          returnReceiptId: null,
          isMock: false,
        },
      }),
    ).toBeNull();
  });
});
