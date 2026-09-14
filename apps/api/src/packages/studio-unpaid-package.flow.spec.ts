import { BadRequestException } from '@nestjs/common';
import { PaymentSource, PaymentStatus } from '@prisma/client';
import { PaymentsAdminMutationService } from '../payments/payments-admin-mutation.service';
import { PaymentsConfirmService } from '../payments/payments-confirm.service';
import { PackageUsageEligibilityService } from './package-usage-eligibility.service';
import { PackageUsageLedgerService } from './package-usage-ledger.service';

jest.mock('./packages-freeze.resume', () => ({
  resumeDueFreezes: jest.fn().mockResolvedValue(undefined),
}));

const SESSION_START = new Date('2026-09-14T10:00:00.000Z');
const SESSION = {
  id: 'session-1',
  startsAt: SESSION_START,
  classType: { id: 'type-1', name: 'Reformer' },
};

function createActiveStudioMembership() {
  return {
    id: 'up-cash',
    userId: 'client-1',
    planId: 'plan-1',
    sourcePlanIdSnapshot: 'plan-1',
    planNameSnapshot: 'Reformer 8',
    planCategoryNameSnapshot: 'Reformer',
    planPriceCentsSnapshot: 120_000,
    planPeriodDaysSnapshot: 30,
    planIsUnlimitedSnapshot: false,
    planSessionsPerMonthSnapshot: 8,
    freezeAllowedCountSnapshot: 0,
    freezeMaxDaysPerUseSnapshot: 0,
    freezesUsedCount: 0,
    status: 'ACTIVE',
    awaitingFirstVisit: false,
    currentPeriodStart: new Date('2026-09-01T00:00:00.000Z'),
    currentPeriodEnd: new Date('2026-10-01T00:00:00.000Z'),
    sessionsTotal: 8,
    sessionsRemaining: 8,
    guestSlotsTotal: 0,
    guestSlotsRemaining: 0,
    createdAt: SESSION_START,
    updatedAt: SESSION_START,
    cancelledAt: null,
    pausedUntil: null,
    pausedAt: null,
    plan: {
      id: 'plan-1',
      name: 'Reformer 8',
      categoryName: 'Reformer',
      isUnlimited: false,
    },
    balances: [
      {
        id: 'balance-1',
        classTypeId: null,
        sourceCategoryNameSnapshot: 'Reformer',
        sessionsTotal: 8,
        sessionsUsed: 0,
        sessionsRemaining: 8,
        isUnlimited: false,
      },
    ],
  };
}

describe('staff-assigned unpaid studio package', () => {
  it('lets the client book with an ACTIVE cash package while payment is PENDING', async () => {
    const membership = createActiveStudioMembership();
    const findMany = jest.fn(
      (args: { where: { userId: string; status: string } }) => {
        void args;
        return Promise.resolve([membership]);
      },
    );
    const eligibility = new PackageUsageEligibilityService({
      userPackage: { findMany },
    } as never);

    const eligible = await eligibility.listEligibleUserPackages({
      userId: 'client-1',
      session: SESSION,
    });
    const selected = await eligibility.getValidatedUserPackageForBooking({
      tx: { userPackage: { findMany } } as never,
      userId: 'client-1',
      session: SESSION,
      userPackageId: 'up-cash',
    });

    expect(findMany.mock.calls[0]?.[0].where).toMatchObject({
      userId: 'client-1',
      status: 'ACTIVE',
    });
    expect(eligible).toHaveLength(1);
    expect(eligible[0]?.userPackageId).toBe('up-cash');
    expect(eligible[0]?.canBook).toBe(true);
    expect(selected.id).toBe('up-cash');
    expect(findMany.mock.calls[0]?.[0].where).not.toHaveProperty(
      'paymentStatus',
    );
  });

  it('does not book a PENDING checkout package that staff never activated', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const eligibility = new PackageUsageEligibilityService({
      userPackage: { findMany },
    } as never);

    await expect(
      eligibility.getValidatedUserPackageForBooking({
        tx: { userPackage: { findMany } } as never,
        userId: 'client-1',
        session: SESSION,
        userPackageId: 'up-pending-card',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deducts a class credit from the unpaid ACTIVE package', async () => {
    const ledger = new PackageUsageLedgerService();
    const tx = {
      userPackageBalance: { update: jest.fn() },
      userPackage: { update: jest.fn() },
      bookingConsumption: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn(),
      },
    };

    await ledger.consumeSession({
      tx: tx as never,
      bookingId: 'booking-1',
      membership: createActiveStudioMembership() as never,
      sessionClassType: SESSION.classType,
      requiredSessions: 1,
    });

    expect(tx.userPackageBalance.update).toHaveBeenCalledWith({
      where: { id: 'balance-1' },
      data: {
        sessionsUsed: { increment: 1 },
        sessionsRemaining: { decrement: 1 },
      },
    });
    expect(tx.userPackage.update).toHaveBeenCalledWith({
      where: { id: 'up-cash' },
      data: { sessionsRemaining: { decrement: 1 } },
    });
  });

  it('marks the cash payment paid without requiring the package to be PENDING', async () => {
    const existing = {
      id: 'pay-cash',
      status: PaymentStatus.PENDING,
      source: PaymentSource.PACKAGE,
      sourceId: 'up-cash',
      paymentMethod: 'CASH',
    };
    const paymentUpdate = jest.fn().mockResolvedValue({
      ...existing,
      status: PaymentStatus.SUCCEEDED,
    });
    const fulfillPaymentBySource = jest.fn().mockResolvedValue({
      giftEmail: null,
      packageStockTracked: false,
    });
    const packagePurchased = {
      tryNotify: jest.fn().mockResolvedValue(undefined),
    };
    const confirm = new PaymentsConfirmService(
      {
        $transaction: jest.fn(
          async (callback: (tx: unknown) => Promise<unknown>) =>
            callback({
              payment: {
                findUnique: jest.fn().mockResolvedValue(existing),
                update: paymentUpdate,
              },
            }),
        ),
      } as never,
      {
        fulfillPaymentBySource,
        emitDropInBookingRealtimeIfNeeded: jest
          .fn()
          .mockResolvedValue(undefined),
      } as never,
      { trySendSuccessEmails: jest.fn().mockResolvedValue(undefined) } as never,
      { tryPrintReceipt: jest.fn() } as never,
      { invalidatePublicPlansCache: jest.fn() } as never,
      packagePurchased as never,
    );

    const paid = await confirm.confirmPayment('pay-cash', 'manager-1', {
      paymentMethod: 'CASH',
    });

    expect(paid.status).toBe(PaymentStatus.SUCCEEDED);
    expect(fulfillPaymentBySource).toHaveBeenCalled();
    expect(packagePurchased.tryNotify).toHaveBeenCalledWith('up-cash');
  });

  it('routes Mark as paid for unpaid studio methods through confirm', async () => {
    const confirmPayment = jest.fn().mockResolvedValue({
      id: 'pay-studio',
      status: PaymentStatus.SUCCEEDED,
    });

    for (const paymentMethod of ['CASH', 'CARD_TERMINAL'] as const) {
      confirmPayment.mockClear();
      const service = new PaymentsAdminMutationService(
        {
          payment: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'pay-studio',
              status: PaymentStatus.PENDING,
              paymentMethod,
            }),
          },
        } as never,
        { confirmPayment } as never,
        { tryPrintReturnReceipt: jest.fn() } as never,
      );

      const result = await service.adminUpdatePaymentStatus(
        'pay-studio',
        PaymentStatus.SUCCEEDED,
        'manager-1',
      );

      expect(confirmPayment).toHaveBeenCalledWith('pay-studio', 'manager-1', {
        paymentMethod,
      });
      expect(result.status).toBe(PaymentStatus.SUCCEEDED);
    }
  });
});
