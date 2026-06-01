import { MembershipStatus } from '@prisma/client';
import { MembershipsService } from './memberships.service';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('MembershipsService', () => {
  function createService() {
    const prisma = {
      payment: {
        create: jest.fn().mockResolvedValue({ id: 'p1' }),
      },
      userMembership: {
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      membershipPlan: {
        findUnique: jest.fn(),
      },
    };
    const audit = { log: jest.fn().mockResolvedValue(undefined) };
    return {
      service: new MembershipsService(prisma as never, audit as never),
      prisma,
      audit,
    };
  }

  it('prorates sessions when changing plan during active period', async () => {
    const { service, prisma, audit } = createService();
    const now = Date.now();
    const periodStart = new Date(now - 5 * DAY_MS);
    const periodEnd = new Date(now + 10 * DAY_MS);
    prisma.userMembership.findFirst.mockResolvedValue({
      id: 'm1',
      userId: 'u1',
      planId: 'old-plan',
      status: MembershipStatus.ACTIVE,
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
    prisma.membershipPlan.findUnique.mockResolvedValue({
      id: 'new-plan',
      isActive: true,
      isUnlimited: false,
      sessionsPerMonth: 12,
      periodDays: 30,
      priceCents: 35_000,
      currency: 'AMD',
    });
    prisma.userMembership.update.mockResolvedValue({
      id: 'm1',
      planId: 'new-plan',
    });

    await service.changePlan('u1', 'm1', 'new-plan');

    expect(prisma.userMembership.update).toHaveBeenCalled();
    const firstUpdateCall = prisma.userMembership.update.mock.calls[0] as [
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
    prisma.userMembership.findFirst.mockResolvedValue({
      id: 'm2',
      userId: 'u1',
      planId: 'old-plan',
      status: MembershipStatus.PAUSED,
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
    prisma.membershipPlan.findUnique.mockResolvedValue({
      id: 'new-plan',
      isActive: true,
      isUnlimited: false,
      sessionsPerMonth: 12,
      periodDays: 30,
      priceCents: 12_000,
      currency: 'AMD',
    });
    prisma.userMembership.update.mockResolvedValue({
      id: 'm2',
      planId: 'new-plan',
    });

    await service.changePlan('u1', 'm2', 'new-plan');

    const secondUpdateCall = prisma.userMembership.update.mock.calls[0] as [
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
    prisma.userMembership.findFirst.mockResolvedValue({
      id: 'm3',
      userId: 'u1',
      planId: 'old-plan',
      status: MembershipStatus.ACTIVE,
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
    prisma.membershipPlan.findUnique.mockResolvedValue({
      id: 'new-plan',
      isActive: true,
      isUnlimited: false,
      sessionsPerMonth: 8,
      periodDays: 30,
      priceCents: 15_000,
      currency: 'AMD',
    });
    prisma.userMembership.update.mockResolvedValue({
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
});
