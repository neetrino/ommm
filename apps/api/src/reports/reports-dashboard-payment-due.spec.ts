import {
  ManualPaymentMethod,
  PaymentSource,
  PaymentStatus,
} from '@prisma/client';
import { loadDashboardStudioPaymentDue } from './reports-dashboard-payment-due';
import { buildAlerts } from './reports-dashboard.helpers';

describe('loadDashboardStudioPaymentDue', () => {
  it('returns unpaid studio packages whose consumed class ended over an hour ago', async () => {
    const paymentFindMany = jest.fn().mockResolvedValue([
      { sourceId: 'up-due' },
      { sourceId: 'up-fresh' },
    ]);
    const consumptionFindMany = jest
      .fn()
      .mockResolvedValue([{ userPackageId: 'up-due' }]);
    const userPackageFindMany = jest.fn().mockResolvedValue([
      {
        id: 'up-due',
        planNameSnapshot: '10-class pack',
        user: {
          id: 'client-1',
          name: 'Payment',
          lastName: 'Due Demo',
          email: 'payment-due-demo@ommm.local',
        },
      },
    ]);

    const result = await loadDashboardStudioPaymentDue(
      {
        payment: { findMany: paymentFindMany },
        bookingConsumption: { findMany: consumptionFindMany },
        userPackage: { findMany: userPackageFindMany },
      },
      new Date('2026-09-14T15:00:00.000Z'),
    );

    expect(paymentFindMany).toHaveBeenCalledWith({
      where: {
        status: PaymentStatus.PENDING,
        source: PaymentSource.PACKAGE,
        sourceId: { not: null },
        paymentMethod: {
          in: [ManualPaymentMethod.CASH, ManualPaymentMethod.CARD_TERMINAL],
        },
      },
      select: { sourceId: true },
    });
    expect(result).toEqual({
      count: 1,
      items: [
        {
          clientId: 'client-1',
          clientName: 'Payment Due Demo',
          packageId: 'up-due',
          packageName: '10-class pack',
        },
      ],
    });
  });

  it('returns an empty list when no overdue unpaid studio packages exist', async () => {
    const result = await loadDashboardStudioPaymentDue({
      payment: { findMany: jest.fn().mockResolvedValue([]) },
      bookingConsumption: { findMany: jest.fn() },
      userPackage: { findMany: jest.fn() },
    });

    expect(result).toEqual({ count: 0, items: [] });
  });
});

describe('buildAlerts', () => {
  it('shows studio payment due even when finance pending-payment alerts are omitted', () => {
    expect(
      buildAlerts({
        fullClassesToday: 0,
        waitlistPressureCount: 0,
        cancelledClassesToday: 0,
        pendingPaymentsCount: 0,
        studioPaymentsDueCount: 2,
        draftClassesUpcoming: 0,
        upcomingCancellationsCount: 0,
      }),
    ).toEqual([
      { code: 'studio_payments_due', level: 'warning', count: 2 },
    ]);
  });
});
