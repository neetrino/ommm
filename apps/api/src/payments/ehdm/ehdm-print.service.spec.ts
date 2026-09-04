import { ManualPaymentMethod, PaymentStatus } from '@prisma/client';
import { EhdmPrintService } from './ehdm-print.service';

jest.mock('./ehdm-retry', () => ({
  sleep: jest.fn().mockResolvedValue(undefined),
}));

const payment = {
  id: 'pay-1',
  paymentReference: 'PKG-1',
  amountCents: 25_000,
  paymentMethod: ManualPaymentMethod.CARD,
  description: 'Package: Yoga',
  sourceId: null,
  source: 'PACKAGE',
  status: PaymentStatus.SUCCEEDED,
  currency: 'amd',
  ehdmReceipt: null,
};

function createService(overrides: {
  configured?: boolean;
  payment?: typeof payment | null;
  print?: jest.Mock;
  reserve?: jest.Mock;
  rollback?: jest.Mock;
}) {
  const prisma = {
    payment: {
      findUnique: jest.fn().mockResolvedValue(overrides.payment ?? payment),
    },
    ehdmReceipt: { create: jest.fn().mockResolvedValue({}) },
    userPackage: { findUnique: jest.fn().mockResolvedValue(null) },
  };
  const seq = {
    reserveNextSeq: overrides.reserve ?? jest.fn().mockResolvedValue(2),
    rollbackSeq: overrides.rollback ?? jest.fn().mockResolvedValue(undefined),
  };
  const api = {
    print:
      overrides.print ??
      jest.fn().mockResolvedValue({
        code: 0,
        result: { receiptId: 8, fiscal: '52517829', qr: 'TIN: 1' },
      }),
  };
  const service = new EhdmPrintService(
    prisma as never,
    {
      isFullyConfigured: () => overrides.configured !== false,
      getCrn: () => '52000000',
      getCashierId: () => 1,
      getDep: () => 3,
      getDefaultAdgCode: () => '9205',
      getDefaultUnit: () => 'Հատ',
    } as never,
    seq as never,
    api as never,
  );
  return { service, prisma, seq, api };
}

describe('EhdmPrintService', () => {
  it('skips print when EHDM is not configured', async () => {
    const { service, api } = createService({ configured: false });
    await service.printReceiptForPayment('pay-1');
    expect(api.print).not.toHaveBeenCalled();
  });

  it('skips print when a receipt already exists', async () => {
    const { service, api, seq } = createService({
      payment: { ...payment, ehdmReceipt: { id: 'r1' } as never },
    });
    await service.printReceiptForPayment('pay-1');
    expect(seq.reserveNextSeq).not.toHaveBeenCalled();
    expect(api.print).not.toHaveBeenCalled();
  });

  it('persists a successful PEC print without writing isMock', async () => {
    const { service, prisma } = createService({});
    await service.printReceiptForPayment('pay-1');
    expect(prisma.ehdmReceipt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          paymentId: 'pay-1',
          receiptId: '8',
          seq: 2,
          fiscal: '52517829',
        }),
      }),
    );
    const data = prisma.ehdmReceipt.create.mock.calls[0]?.[0].data as {
      isMock?: boolean;
    };
    expect(data.isMock).toBeUndefined();
  });

  it('rolls back seq and retries on explicit PEC reject', async () => {
    const print = jest
      .fn()
      .mockResolvedValueOnce({ code: 1, errorMessage: 'bad seq' })
      .mockResolvedValueOnce({
        code: 0,
        result: { receiptId: 9, fiscal: '1' },
      });
    const reserve = jest.fn().mockResolvedValueOnce(2).mockResolvedValueOnce(3);
    const rollback = jest.fn().mockResolvedValue(undefined);
    const { service, prisma } = createService({ print, reserve, rollback });

    await service.printReceiptForPayment('pay-1');

    expect(rollback).toHaveBeenCalledWith(2);
    expect(print).toHaveBeenCalledTimes(2);
    expect(prisma.ehdmReceipt.create).toHaveBeenCalled();
  });

  it('does not rollback seq on transport timeout', async () => {
    const print = jest.fn().mockRejectedValue(new Error('socket hang up'));
    const rollback = jest.fn();
    const { service } = createService({ print, rollback });

    await service.printReceiptForPayment('pay-1');

    expect(rollback).not.toHaveBeenCalled();
    expect(print).toHaveBeenCalledTimes(1);
  });
});
