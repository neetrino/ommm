import { PaymentStatus } from '@prisma/client';
import { EhdmReceiptService } from './ehdm-receipt.service';

describe('EhdmReceiptService', () => {
  const printService = { printReceiptForPayment: jest.fn() };
  const returnService = { printReturnForPayment: jest.fn() };

  it('does not print when previous status is already SUCCEEDED', () => {
    const service = new EhdmReceiptService(
      { isEnabled: () => true } as never,
      printService as never,
      returnService as never,
    );
    service.tryPrintReceipt('pay-1', PaymentStatus.SUCCEEDED);
    expect(printService.printReceiptForPayment).not.toHaveBeenCalled();
  });

  it('hides leftover mock receipts from summaries', () => {
    const service = new EhdmReceiptService(
      { isEnabled: () => true } as never,
      printService as never,
      returnService as never,
    );
    expect(
      service.toReceiptSummary({
        receiptId: 'MOCK-1',
        seq: 1,
        fiscal: 'MOCK',
        qr: 'https://mock.ehdm.local/1',
        isMock: true,
        response: null,
        createdAt: new Date(),
      }),
    ).toBeNull();
  });

  it('maps taxpayer, tin, time, and total from PEC JSON', () => {
    const service = new EhdmReceiptService(
      { isEnabled: () => true } as never,
      printService as never,
      returnService as never,
    );
    const summary = service.toReceiptSummary({
      receiptId: '8',
      seq: 2,
      fiscal: '52517829',
      qr: 'TIN: 00493113',
      isMock: false,
      response: {
        code: 0,
        result: {
          taxpayer: 'Ommm',
          tin: '00493113',
          time: 1721140445000,
          total: 25000,
        },
      },
      createdAt: new Date('2026-09-03T00:00:00.000Z'),
    });
    expect(summary).toEqual(
      expect.objectContaining({
        receiptId: '8',
        taxpayer: 'Ommm',
        tin: '00493113',
        time: 1721140445000,
        total: 25000,
      }),
    );
  });
});
