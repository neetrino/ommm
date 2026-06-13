import { ConflictException } from '@nestjs/common';
import {
  ManualPaymentMethod,
  PackageStatus,
  PaymentStatus,
} from '@prisma/client';
import { PackageUsageService } from './package-usage.service';
import { PackagesService } from './packages.service';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('PackagesService', () => {
  function createService() {
    const prisma = {
      payment: {
        create: jest.fn().mockResolvedValue({ id: 'p1' }),
      },
      userPackage: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      packagePlan: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      $transaction: jest.fn(),
    };
    const audit = { log: jest.fn().mockResolvedValue(undefined) };
    const cache = {
      getOrSet: jest.fn(),
      invalidate: jest.fn().mockResolvedValue(undefined),
      invalidateByPrefix: jest.fn().mockResolvedValue(undefined),
    };
    const payments = {
      confirmPendingCardPayment: jest.fn().mockResolvedValue(undefined),
      notifyCashPaymentPending: jest.fn().mockResolvedValue(undefined),
      isArcaCheckoutEnabled: jest.fn().mockReturnValue(false),
    };
    const packageUsage = new PackageUsageService(prisma as never);
    return {
      service: new PackagesService(
        prisma as never,
        audit as never,
        cache as never,
        packageUsage,
        payments as never,
      ),
      prisma,
      audit,
      cache,
      packageUsage,
      payments,
    };
  }

  it('prorates sessions when changing plan during active period', async () => {
    const { service, prisma, audit } = createService();
    const now = Date.now();
    const periodStart = new Date(now - 5 * DAY_MS);
    const periodEnd = new Date(now + 10 * DAY_MS);
    prisma.userPackage.findFirst.mockResolvedValue({
      id: 'm1',
      userId: 'u1',
      planId: 'old-plan',
      status: PackageStatus.ACTIVE,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      plan: {
        id: 'old-plan',
        isUnlimited: false,
        sessionsPerMonth: 10,
        periodDays: 30,
        priceCents: 20_000,
      },
    });
    prisma.packagePlan.findUnique.mockResolvedValue({
      id: 'new-plan',
      isActive: true,
      isUnlimited: false,
      sessionsPerMonth: 12,
      periodDays: 30,
      priceCents: 35_000,
      currency: 'AMD',
    });
    prisma.userPackage.update.mockResolvedValue({
      id: 'm1',
      planId: 'new-plan',
    });

    await service.changePlan('u1', 'm1', 'new-plan');

    expect(prisma.userPackage.update).toHaveBeenCalled();
    const firstUpdateCall = prisma.userPackage.update.mock.calls[0] as [
      {
        data: {
          currentPeriodStart: Date;
          currentPeriodEnd: Date;
          sessionsRemaining: number | null;
        };
      },
    ];
    const updateData = firstUpdateCall[0].data;
    expect(updateData.currentPeriodStart.toISOString()).toBe(
      periodStart.toISOString(),
    );
    expect(updateData.currentPeriodEnd.toISOString()).toBe(
      periodEnd.toISOString(),
    );
    expect(updateData.sessionsRemaining).toBe(8);
    const paymentCall = prisma.payment.create.mock.calls[0] as [
      { data: { userId: string; amountCents: number; status: string } },
    ];
    expect(paymentCall[0].data.userId).toBe('u1');
    expect(paymentCall[0].data.amountCents).toBe(10000);
    expect(paymentCall[0].data.status).toBe('SUCCEEDED');
    const firstAuditCall = audit.log.mock.calls[0] as [
      {
        action: string;
        payload: {
          prorationApplied?: boolean;
          prorationAdjustmentCents?: number;
        };
      },
    ];
    expect(firstAuditCall[0].action).toBe('MEMBERSHIP_PLAN_CHANGED');
    expect(firstAuditCall[0].payload.prorationApplied).toBe(true);
    expect(firstAuditCall[0].payload.prorationAdjustmentCents).toBe(10000);
  });

  it('resets cycle when changing plan outside active period', async () => {
    const { service, prisma, audit } = createService();
    const now = Date.now();
    prisma.userPackage.findFirst.mockResolvedValue({
      id: 'm2',
      userId: 'u1',
      planId: 'old-plan',
      status: PackageStatus.PAUSED,
      currentPeriodStart: new Date(now - 20 * DAY_MS),
      currentPeriodEnd: new Date(now + 10 * DAY_MS),
      plan: {
        id: 'old-plan',
        isUnlimited: false,
        sessionsPerMonth: 10,
        periodDays: 30,
        priceCents: 20_000,
      },
    });
    prisma.packagePlan.findUnique.mockResolvedValue({
      id: 'new-plan',
      isActive: true,
      isUnlimited: false,
      sessionsPerMonth: 12,
      periodDays: 30,
      priceCents: 12_000,
      currency: 'AMD',
    });
    prisma.userPackage.update.mockResolvedValue({
      id: 'm2',
      planId: 'new-plan',
    });

    await service.changePlan('u1', 'm2', 'new-plan');

    const secondUpdateCall = prisma.userPackage.update.mock.calls[0] as [
      {
        data: {
          currentPeriodStart: Date;
          currentPeriodEnd: Date;
          sessionsRemaining: number | null;
        };
      },
    ];
    const updateData = secondUpdateCall[0].data;
    expect(updateData.sessionsRemaining).toBe(12);
    expect(updateData.currentPeriodStart.getTime()).toBeGreaterThan(
      now - DAY_MS,
    );
    expect(updateData.currentPeriodEnd.getTime()).toBeGreaterThan(
      updateData.currentPeriodStart.getTime(),
    );
    expect(prisma.payment.create).not.toHaveBeenCalled();
    const pausedAuditCall = audit.log.mock.calls[0] as [
      {
        action: string;
        payload: {
          prorationApplied?: boolean;
          prorationAdjustmentCents?: number;
        };
      },
    ];
    expect(pausedAuditCall[0].action).toBe('MEMBERSHIP_PLAN_CHANGED');
    expect(pausedAuditCall[0].payload.prorationApplied).toBe(false);
    expect(pausedAuditCall[0].payload.prorationAdjustmentCents).toBe(0);
  });

  it('creates credit adjustment when active plan change is a downgrade', async () => {
    const { service, prisma } = createService();
    const now = Date.now();
    prisma.userPackage.findFirst.mockResolvedValue({
      id: 'm3',
      userId: 'u1',
      planId: 'old-plan',
      status: PackageStatus.ACTIVE,
      currentPeriodStart: new Date(now - 10 * DAY_MS),
      currentPeriodEnd: new Date(now + 10 * DAY_MS),
      plan: {
        id: 'old-plan',
        isUnlimited: false,
        sessionsPerMonth: 12,
        periodDays: 30,
        priceCents: 30_000,
      },
    });
    prisma.packagePlan.findUnique.mockResolvedValue({
      id: 'new-plan',
      isActive: true,
      isUnlimited: false,
      sessionsPerMonth: 8,
      periodDays: 30,
      priceCents: 15_000,
      currency: 'AMD',
    });
    prisma.userPackage.update.mockResolvedValue({
      id: 'm3',
      planId: 'new-plan',
    });

    await service.changePlan('u1', 'm3', 'new-plan');

    const creditPaymentCall = prisma.payment.create.mock.calls[0] as [
      {
        data: {
          userId: string;
          amountCents: number;
          description?: string | null;
        };
      },
    ];
    expect(creditPaymentCall[0].data.userId).toBe('u1');
    expect(creditPaymentCall[0].data.amountCents).toBe(-7500);
    expect(creditPaymentCall[0].data.description).toContain('proration credit');
  });

  it('activates cash package subscriptions immediately while payment stays pending', async () => {
    const { service, prisma, payments } = createService();
    const txUserPackageCreate = jest.fn().mockResolvedValue({
      id: 'pkg-cash',
      userId: 'u1',
      planId: 'plan-1',
      status: PackageStatus.ACTIVE,
      plan: { name: 'Monthly' },
    });
    const txPaymentCreate = jest.fn().mockResolvedValue({
      id: 'pay-cash',
      paymentReference: 'PKG-REF-1',
    });
    prisma.packagePlan.findUnique.mockResolvedValue({
      id: 'plan-1',
      name: 'Monthly',
      isActive: true,
      priceCents: 20_000,
      periodDays: 30,
      isUnlimited: false,
      sessionsPerMonth: 8,
    });
    prisma.userPackage.findFirst.mockResolvedValue(null);
    prisma.$transaction.mockImplementation(
      (
        callback: (tx: {
          userPackage: { create: typeof txUserPackageCreate };
          payment: { create: typeof txPaymentCreate };
        }) => unknown,
      ) =>
        callback({
          userPackage: { create: txUserPackageCreate },
          payment: { create: txPaymentCreate },
        }),
    );

    const result = await service.subscribeWithManualPayment(
      'u1',
      'plan-1',
      ManualPaymentMethod.CASH,
    );

    expect(txUserPackageCreate).toHaveBeenCalled();
    const userPackageCreateCall = txUserPackageCreate.mock.calls[0] as [
      { data: { status: PackageStatus } },
    ];
    expect(userPackageCreateCall[0].data.status).toBe(PackageStatus.ACTIVE);

    expect(txPaymentCreate).toHaveBeenCalled();
    const paymentCreateCall = txPaymentCreate.mock.calls[0] as [
      {
        data: {
          status: PaymentStatus;
          paymentMethod: ManualPaymentMethod;
        };
      },
    ];
    expect(paymentCreateCall[0].data.status).toBe(PaymentStatus.PENDING);
    expect(paymentCreateCall[0].data.paymentMethod).toBe(
      ManualPaymentMethod.CASH,
    );
    expect(payments.confirmPendingCardPayment).not.toHaveBeenCalled();
    expect(payments.notifyCashPaymentPending).toHaveBeenCalledWith('pay-cash');
    expect(result.paymentReference).toBe('PKG-REF-1');
  });

  it('keeps card package subscriptions pending until checkout confirmation', async () => {
    const { service, prisma, payments } = createService();
    const txUserPackageCreate = jest.fn().mockResolvedValue({
      id: 'pkg-card',
      userId: 'u1',
      planId: 'plan-1',
      status: PackageStatus.PENDING,
      plan: { name: 'Monthly' },
    });
    const txPaymentCreate = jest.fn().mockResolvedValue({
      id: 'pay-card',
      paymentReference: 'PKG-REF-2',
    });
    prisma.packagePlan.findUnique.mockResolvedValue({
      id: 'plan-1',
      name: 'Monthly',
      isActive: true,
      priceCents: 20_000,
      periodDays: 30,
      isUnlimited: false,
      sessionsPerMonth: 8,
    });
    prisma.userPackage.findFirst.mockResolvedValue(null);
    prisma.$transaction.mockImplementation(
      (
        callback: (tx: {
          userPackage: { create: typeof txUserPackageCreate };
          payment: { create: typeof txPaymentCreate };
        }) => unknown,
      ) =>
        callback({
          userPackage: { create: txUserPackageCreate },
          payment: { create: txPaymentCreate },
        }),
    );

    await service.subscribeWithManualPayment(
      'u1',
      'plan-1',
      ManualPaymentMethod.CARD,
    );

    expect(txUserPackageCreate).toHaveBeenCalled();
    const userPackageCreateCall = txUserPackageCreate.mock.calls[0] as [
      { data: { status: PackageStatus } },
    ];
    expect(userPackageCreateCall[0].data.status).toBe(PackageStatus.PENDING);
    expect(payments.confirmPendingCardPayment).toHaveBeenCalledWith('pay-card');
  });

  function mockDeleteTransaction(
    prisma: ReturnType<typeof createService>['prisma'],
  ) {
    prisma.$transaction.mockImplementation(
      (callback: (tx: typeof prisma) => unknown) => callback(prisma),
    );
  }

  it('deletes a plan when only cancelled or expired memberships exist', async () => {
    const { service, prisma, audit, cache } = createService();
    prisma.packagePlan.findUnique.mockResolvedValue({ id: 'plan-1' });
    mockDeleteTransaction(prisma);
    prisma.userPackage.updateMany.mockResolvedValue({ count: 0 });
    prisma.userPackage.count.mockResolvedValue(0);
    prisma.userPackage.deleteMany.mockResolvedValue({ count: 2 });
    prisma.packagePlan.deleteMany.mockResolvedValue({ count: 1 });

    const result = await service.deletePlan('plan-1');

    expect(result).toEqual({ ok: true });
    expect(prisma.userPackage.count).toHaveBeenCalledWith({
      where: {
        planId: { in: ['plan-1'] },
        status: {
          in: [
            PackageStatus.ACTIVE,
            PackageStatus.PENDING,
            PackageStatus.PAUSED,
          ],
        },
      },
    });
    expect(prisma.userPackage.deleteMany).toHaveBeenCalledWith({
      where: {
        planId: { in: ['plan-1'] },
        status: { in: [PackageStatus.CANCELLED, PackageStatus.EXPIRED] },
      },
    });
    expect(prisma.packagePlan.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['plan-1'] } },
    });
    expect(cache.invalidate).toHaveBeenCalled();
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'MEMBERSHIP_PLAN_DELETED',
        entityId: 'plan-1',
      }),
    );
  });

  it('blocks plan deletion when active memberships remain', async () => {
    const { service, prisma } = createService();
    prisma.packagePlan.findUnique.mockResolvedValue({ id: 'plan-1' });
    mockDeleteTransaction(prisma);
    prisma.userPackage.updateMany.mockResolvedValue({ count: 0 });
    prisma.userPackage.count.mockResolvedValue(2);

    await expect(service.deletePlan('plan-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(prisma.userPackage.deleteMany).not.toHaveBeenCalled();
    expect(prisma.packagePlan.deleteMany).not.toHaveBeenCalled();
  });

  it('expires overdue active memberships before evaluating deletion blockers', async () => {
    const { service, prisma } = createService();
    prisma.packagePlan.findUnique.mockResolvedValue({ id: 'plan-1' });
    mockDeleteTransaction(prisma);
    prisma.userPackage.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValue({ count: 0 });
    prisma.userPackage.count.mockResolvedValue(0);
    prisma.userPackage.deleteMany.mockResolvedValue({ count: 1 });
    prisma.packagePlan.deleteMany.mockResolvedValue({ count: 1 });

    await service.deletePlan('plan-1');

    expect(prisma.userPackage.updateMany).toHaveBeenCalled();
    const expireMembershipsCall = prisma.userPackage.updateMany.mock
      .calls[0] as [
      {
        where: {
          planId: { in: string[] };
          status: PackageStatus;
          currentPeriodEnd: { lte: Date };
        };
        data: { status: PackageStatus };
      },
    ];
    expect(expireMembershipsCall[0].where.planId).toEqual({ in: ['plan-1'] });
    expect(expireMembershipsCall[0].where.status).toBe(PackageStatus.ACTIVE);
    expect(expireMembershipsCall[0].where.currentPeriodEnd.lte).toBeInstanceOf(
      Date,
    );
    expect(expireMembershipsCall[0].data.status).toBe(PackageStatus.EXPIRED);
  });
});
