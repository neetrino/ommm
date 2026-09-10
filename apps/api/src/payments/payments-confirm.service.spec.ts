import { PaymentSource, PaymentStatus } from '@prisma/client';
import { PaymentsConfirmService } from './payments-confirm.service';

describe('PaymentsConfirmService package stock cache', () => {
  function createService(params: { packageStockTracked: boolean }) {
    const existing = {
      id: 'pay-1',
      status: PaymentStatus.PENDING,
      source: PaymentSource.PACKAGE,
      sourceId: 'up-1',
      paymentMethod: 'CASH',
    };
    const packagesPublic = {
      invalidatePublicPlansCache: jest.fn().mockResolvedValue(undefined),
    };
    const service = new PaymentsConfirmService(
      {
        $transaction: jest.fn(
          async (callback: (tx: unknown) => Promise<unknown>) =>
            callback({
              payment: {
                findUnique: jest.fn().mockResolvedValue(existing),
                update: jest.fn().mockResolvedValue({
                  ...existing,
                  status: PaymentStatus.SUCCEEDED,
                }),
              },
            }),
        ),
      } as never,
      {
        fulfillPaymentBySource: jest.fn().mockResolvedValue({
          giftEmail: null,
          packageStockTracked: params.packageStockTracked,
        }),
        emitDropInBookingRealtimeIfNeeded: jest
          .fn()
          .mockResolvedValue(undefined),
      } as never,
      { trySendSuccessEmails: jest.fn().mockResolvedValue(undefined) } as never,
      { tryPrintReceipt: jest.fn() } as never,
      packagesPublic as never,
      { tryNotify: jest.fn().mockResolvedValue(undefined) } as never,
    );
    return { service, packagesPublic };
  }

  it('invalidates public plans after stock is decremented on confirm', async () => {
    const { service, packagesPublic } = createService({
      packageStockTracked: true,
    });

    await service.confirmPayment('pay-1', 'admin-1');

    expect(packagesPublic.invalidatePublicPlansCache).toHaveBeenCalledTimes(1);
  });

  it('keeps the public cache when confirm did not decrement stock', async () => {
    const { service, packagesPublic } = createService({
      packageStockTracked: false,
    });

    await service.confirmPayment('pay-1', 'admin-1');

    expect(packagesPublic.invalidatePublicPlansCache).not.toHaveBeenCalled();
  });
});
