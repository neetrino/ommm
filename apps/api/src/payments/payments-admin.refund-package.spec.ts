import { PaymentSource, PaymentStatus, UserPackageStatus } from '@prisma/client';
import { PaymentsAdminService } from './payments-admin.service';

describe('PaymentsAdminService refund cancels package', () => {
  it('cancels the linked ACTIVE user package when payment is refunded', async () => {
    const payment = {
      id: 'pay-1',
      status: PaymentStatus.SUCCEEDED,
      paymentMethod: null,
      confirmedAt: new Date('2026-08-01T00:00:00.000Z'),
      metadata: null,
      source: PaymentSource.PACKAGE,
      sourceId: 'up-1',
    };
    const prisma = {
      payment: {
        findUnique: jest.fn().mockResolvedValue(payment),
        update: jest.fn().mockResolvedValue({
          ...payment,
          status: PaymentStatus.REFUNDED,
        }),
      },
      userPackage: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const service = new PaymentsAdminService(
      prisma as never,
      {} as never,
      { trySendSuccessEmails: jest.fn() } as never,
    );

    await service.adminUpdatePaymentStatus(
      'pay-1',
      PaymentStatus.REFUNDED,
      'admin-1',
    );

    expect(prisma.userPackage.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'up-1',
        status: {
          in: [
            UserPackageStatus.ACTIVE,
            UserPackageStatus.PAUSED,
            UserPackageStatus.PENDING,
          ],
        },
      },
      data: { status: UserPackageStatus.CANCELLED },
    });
  });

  it('does not touch packages for non-package refunds', async () => {
    const payment = {
      id: 'pay-2',
      status: PaymentStatus.SUCCEEDED,
      paymentMethod: null,
      confirmedAt: new Date('2026-08-01T00:00:00.000Z'),
      metadata: null,
      source: PaymentSource.DROPIN,
      sourceId: 'session-1',
    };
    const prisma = {
      payment: {
        findUnique: jest.fn().mockResolvedValue(payment),
        update: jest.fn().mockResolvedValue({
          ...payment,
          status: PaymentStatus.REFUNDED,
        }),
      },
      userPackage: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    const service = new PaymentsAdminService(
      prisma as never,
      {} as never,
      { trySendSuccessEmails: jest.fn() } as never,
    );

    await service.adminUpdatePaymentStatus(
      'pay-2',
      PaymentStatus.REFUNDED,
      'admin-1',
    );

    expect(prisma.userPackage.updateMany).not.toHaveBeenCalled();
  });
});
