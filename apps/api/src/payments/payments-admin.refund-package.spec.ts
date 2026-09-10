import {
  PaymentSource,
  PaymentStatus,
  UserPackageStatus,
} from '@prisma/client';
import { PaymentsAdminMutationService } from './payments-admin-mutation.service';

describe('PaymentsAdminMutationService refund cancels package', () => {
  it('cancels the linked ACTIVE user package when payment is refunded', async () => {
    const payment = {
      id: 'pay-1',
      status: PaymentStatus.SUCCEEDED,
      paymentMethod: null,
      confirmedAt: new Date('2026-08-01T00:00:00.000Z'),
      metadata: null,
      source: PaymentSource.PACKAGE,
      sourceId: 'up-1',
      userId: 'user-1',
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
      user: {
        update: jest.fn(),
      },
    };
    const ehdmReceipt = {
      tryPrintReturnReceipt: jest.fn(),
    };
    const service = new PaymentsAdminMutationService(
      prisma as never,
      {} as never,
      ehdmReceipt as never,
    );

    await service.adminUpdatePaymentStatus(
      'pay-1',
      PaymentStatus.REFUNDED,
      'admin-1',
    );

    expect(ehdmReceipt.tryPrintReturnReceipt).toHaveBeenCalledWith('pay-1');
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
      userId: 'user-1',
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
    const ehdmReceipt = {
      tryPrintReturnReceipt: jest.fn(),
    };
    const service = new PaymentsAdminMutationService(
      prisma as never,
      {} as never,
      ehdmReceipt as never,
    );

    await service.adminUpdatePaymentStatus(
      'pay-2',
      PaymentStatus.REFUNDED,
      'admin-1',
    );

    expect(ehdmReceipt.tryPrintReturnReceipt).toHaveBeenCalledWith('pay-2');
    expect(prisma.userPackage.updateMany).not.toHaveBeenCalled();
  });

  it('rejects swapping an online card payment method', async () => {
    const service = new PaymentsAdminMutationService(
      {
        payment: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'pay-card',
            paymentMethod: 'CARD',
          }),
        },
      } as never,
      {} as never,
      {} as never,
    );

    await expect(
      service.adminUpdatePaymentMethod('pay-card', 'CASH', 'manager-1'),
    ).rejects.toThrow('Only cash and terminal payment methods can be swapped');
  });

  it('confirms unpaid studio payments through confirmPayment', async () => {
    const confirmPayment = jest.fn().mockResolvedValue({ id: 'pay-cash' });
    const service = new PaymentsAdminMutationService(
      {
        payment: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'pay-cash',
            status: PaymentStatus.PENDING,
            paymentMethod: 'CASH',
          }),
        },
      } as never,
      { confirmPayment } as never,
      {} as never,
    );

    await service.adminUpdatePaymentStatus(
      'pay-cash',
      PaymentStatus.SUCCEEDED,
      'admin-1',
    );

    expect(confirmPayment).toHaveBeenCalledWith('pay-cash', 'admin-1', {
      paymentMethod: 'CASH',
    });
  });

  it('cancels an unpaid package when studio payment is failed', async () => {
    const payment = {
      id: 'pay-fail',
      status: PaymentStatus.PENDING,
      paymentMethod: 'CASH',
      confirmedAt: null,
      metadata: null,
      source: PaymentSource.PACKAGE,
      sourceId: 'up-pending',
      userId: 'user-1',
    };
    const prisma = {
      payment: {
        findUnique: jest.fn().mockResolvedValue(payment),
        update: jest.fn().mockResolvedValue({
          ...payment,
          status: PaymentStatus.FAILED,
        }),
      },
      userPackage: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const service = new PaymentsAdminMutationService(
      prisma as never,
      {} as never,
      { tryPrintReturnReceipt: jest.fn() } as never,
    );

    await service.adminUpdatePaymentStatus(
      'pay-fail',
      PaymentStatus.FAILED,
      'admin-1',
    );

    expect(prisma.userPackage.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'up-pending' }),
        data: { status: UserPackageStatus.CANCELLED },
      }),
    );
  });

  it('reverts a paid studio package to PENDING when marked unpaid', async () => {
    const payment = {
      id: 'pay-revert',
      status: PaymentStatus.SUCCEEDED,
      paymentMethod: 'CARD_TERMINAL',
      confirmedAt: new Date('2026-09-01T00:00:00.000Z'),
      metadata: null,
      source: PaymentSource.PACKAGE,
      sourceId: 'up-paid',
      userId: 'user-1',
    };
    const prisma = {
      payment: {
        findUnique: jest.fn().mockResolvedValue(payment),
        update: jest.fn().mockResolvedValue({
          ...payment,
          status: PaymentStatus.PENDING,
        }),
      },
      userPackage: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const service = new PaymentsAdminMutationService(
      prisma as never,
      {} as never,
      { tryPrintReturnReceipt: jest.fn() } as never,
    );

    await service.adminUpdatePaymentStatus(
      'pay-revert',
      PaymentStatus.PENDING,
      'admin-1',
    );

    expect(prisma.userPackage.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 'up-paid' }),
        data: { status: UserPackageStatus.PENDING },
      }),
    );
  });

  it('rejects painting a failed studio payment as succeeded', async () => {
    const service = new PaymentsAdminMutationService(
      {
        payment: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'pay-failed',
            status: PaymentStatus.FAILED,
            paymentMethod: 'CASH',
          }),
        },
      } as never,
      { confirmPayment: jest.fn() } as never,
      {} as never,
    );

    await expect(
      service.adminUpdatePaymentStatus(
        'pay-failed',
        PaymentStatus.SUCCEEDED,
        'admin-1',
      ),
    ).rejects.toThrow('Studio payment status cannot move from this state');
  });

  it('refunds reserved gift credits once when an unpaid package is failed', async () => {
    const payment = {
      id: 'pay-gift',
      status: PaymentStatus.PENDING,
      paymentMethod: 'CASH',
      confirmedAt: null,
      metadata: { giftCreditsAppliedCents: 4_000 },
      source: PaymentSource.PACKAGE,
      sourceId: 'up-gift',
      userId: 'user-1',
    };
    const prisma = {
      payment: {
        findUnique: jest.fn().mockResolvedValue(payment),
        update: jest.fn().mockResolvedValue({
          ...payment,
          status: PaymentStatus.FAILED,
        }),
      },
      userPackage: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      user: {
        update: jest.fn().mockResolvedValue({}),
      },
    };
    const service = new PaymentsAdminMutationService(
      prisma as never,
      {} as never,
      { tryPrintReturnReceipt: jest.fn() } as never,
    );

    await service.adminUpdatePaymentStatus(
      'pay-gift',
      PaymentStatus.FAILED,
      'admin-1',
    );

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { giftCreditsCents: { increment: 4_000 } },
    });
    expect(prisma.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          metadata: expect.objectContaining({
            giftCreditsRefunded: true,
          }),
        }),
      }),
    );
  });
});
