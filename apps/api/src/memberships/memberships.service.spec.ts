import { MembershipStatus } from '@prisma/client';
import { MembershipsService } from './memberships.service';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('MembershipsService', () => {
  function createService() {
    const prisma = {
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
      },
    });
    prisma.membershipPlan.findUnique.mockResolvedValue({
      id: 'new-plan',
      isActive: true,
      isUnlimited: false,
      sessionsPerMonth: 12,
      periodDays: 30,
    });
    prisma.userMembership.update.mockResolvedValue({
      id: 'm1',
      planId: 'new-plan',
    });

    await service.changePlan('u1', 'm1', 'new-plan');

    expect(prisma.userMembership.update).toHaveBeenCalled();
    const updateData = prisma.userMembership.update.mock.calls[0]?.[0]?.data as {
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      sessionsRemaining: number | null;
    };
    expect(updateData.currentPeriodStart.toISOString()).toBe(
      periodStart.toISOString(),
    );
    expect(updateData.currentPeriodEnd.toISOString()).toBe(periodEnd.toISOString());
    expect(updateData.sessionsRemaining).toBe(8);
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'MEMBERSHIP_PLAN_CHANGED',
        payload: expect.objectContaining({ prorationApplied: true }),
      }),
    );
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
      },
    });
    prisma.membershipPlan.findUnique.mockResolvedValue({
      id: 'new-plan',
      isActive: true,
      isUnlimited: false,
      sessionsPerMonth: 12,
      periodDays: 30,
    });
    prisma.userMembership.update.mockResolvedValue({
      id: 'm2',
      planId: 'new-plan',
    });

    await service.changePlan('u1', 'm2', 'new-plan');

    const updateData = prisma.userMembership.update.mock.calls[0]?.[0]?.data as {
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      sessionsRemaining: number | null;
    };
    expect(updateData.sessionsRemaining).toBe(12);
    expect(updateData.currentPeriodStart.getTime()).toBeGreaterThan(now - DAY_MS);
    expect(updateData.currentPeriodEnd.getTime()).toBeGreaterThan(
      updateData.currentPeriodStart.getTime(),
    );
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'MEMBERSHIP_PLAN_CHANGED',
        payload: expect.objectContaining({ prorationApplied: false }),
      }),
    );
  });
});
