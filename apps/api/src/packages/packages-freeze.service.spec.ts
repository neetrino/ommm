import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  Role,
  UserPackageFreezeInitiator,
  UserPackageFreezeStatus,
  UserPackageStatus,
} from '@prisma/client';
import { FREEZE_ERROR } from './packages-freeze.constants';
import { PackagesFreezeService } from './packages-freeze.service';

function createPlan() {
  return {
    id: 'plan-1',
    freezeAllowedCount: 1,
    freezeMaxDaysPerUse: 7,
  };
}

function createLoadedPackage(
  overrides: Record<string, unknown> = {},
) {
  const now = new Date('2026-08-10T10:00:00.000Z');
  return {
    id: 'pkg-1',
    userId: 'user-1',
    planId: 'plan-1',
    sourcePlanIdSnapshot: 'plan-1',
    planNameSnapshot: 'Reformer 8',
    planCategoryNameSnapshot: 'Reformer',
    planPriceCentsSnapshot: 105_000,
    planPeriodDaysSnapshot: 40,
    planIsUnlimitedSnapshot: false,
    planSessionsPerMonthSnapshot: 8,
    status: UserPackageStatus.ACTIVE,
    currentPeriodStart: now,
    currentPeriodEnd: new Date('2026-09-10T10:00:00.000Z'),
    sessionsTotal: 8,
    sessionsRemaining: 8,
    freezeAllowedCountSnapshot: 1,
    freezeMaxDaysPerUseSnapshot: 7,
    freezesUsedCount: 0,
    pausedAt: null,
    pausedUntil: null,
    createdAt: now,
    updatedAt: now,
    plan: createPlan(),
    user: { id: 'user-1', role: Role.USER },
    ...overrides,
  };
}

function createPrisma() {
  const userPackage = {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    update: jest.fn(),
  };
  const userPackageFreeze = {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  };
  const booking = { findFirst: jest.fn().mockResolvedValue(null) };
  const prisma = {
    userPackage,
    userPackageFreeze,
    booking,
    $transaction: jest.fn(
      async (callback: (tx: typeof prisma) => Promise<unknown>) =>
        callback(prisma),
    ),
  };
  return { prisma, userPackage, userPackageFreeze, booking };
}

describe('PackagesFreezeService', () => {
  it('freezes an active package within the plan limit', async () => {
    const { prisma, userPackage, userPackageFreeze } = createPrisma();
    const loaded = createLoadedPackage();
    const paused = {
      ...loaded,
      status: UserPackageStatus.PAUSED,
      freezesUsedCount: 1,
      pausedAt: new Date('2026-08-10T10:00:00.000Z'),
      pausedUntil: new Date('2026-08-17T10:00:00.000Z'),
    };
    userPackage.findFirst.mockResolvedValue(loaded);
    userPackage.findUnique.mockResolvedValue(loaded);
    userPackage.update.mockResolvedValue(paused);
    const service = new PackagesFreezeService(prisma as never);

    const result = await service.freezeForUser('user-1', 'pkg-1', 7);

    expect(userPackageFreeze.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userPackageId: 'pkg-1',
        daysRequested: 7,
        initiatedBy: UserPackageFreezeInitiator.USER,
        status: UserPackageFreezeStatus.ACTIVE,
      }),
    });
    expect(result.status).toBe(UserPackageStatus.PAUSED);
    expect(result.freeze.usedCount).toBe(1);
    expect(result.freeze.remainingCount).toBe(0);
    expect(result.freeze.canFreeze).toBe(false);
  });

  it('rejects a second freeze when the limit is already used', async () => {
    const { prisma, userPackage } = createPrisma();
    const loaded = createLoadedPackage({ freezesUsedCount: 1 });
    userPackage.findFirst.mockResolvedValue(loaded);
    userPackage.findUnique.mockResolvedValue(loaded);
    const service = new PackagesFreezeService(prisma as never);

    await expect(service.freezeForUser('user-1', 'pkg-1', 7)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(service.freezeForUser('user-1', 'pkg-1', 7)).rejects.toMatchObject({
      message: FREEZE_ERROR.NO_REMAINING,
    });
  });

  it('rejects freeze days above the plan maximum', async () => {
    const { prisma, userPackage } = createPrisma();
    const loaded = createLoadedPackage();
    userPackage.findFirst.mockResolvedValue(loaded);
    userPackage.findUnique.mockResolvedValue(loaded);
    const service = new PackagesFreezeService(prisma as never);

    await expect(service.freezeForUser('user-1', 'pkg-1', 8)).rejects.toMatchObject({
      message: FREEZE_ERROR.INVALID_DAYS,
    });
  });

  it('rejects freeze when the package has upcoming bookings', async () => {
    const { prisma, userPackage, booking } = createPrisma();
    const loaded = createLoadedPackage();
    userPackage.findFirst.mockResolvedValue(loaded);
    userPackage.findUnique.mockResolvedValue(loaded);
    booking.findFirst.mockResolvedValue({ id: 'booking-1' });
    const service = new PackagesFreezeService(prisma as never);

    await expect(service.freezeForUser('user-1', 'pkg-1', 3)).rejects.toMatchObject({
      message: FREEZE_ERROR.UPCOMING_BOOKINGS,
    });
  });

  it('rejects freeze when the plan does not allow it', async () => {
    const { prisma, userPackage } = createPrisma();
    const loaded = createLoadedPackage({
      freezeAllowedCountSnapshot: 0,
      freezeMaxDaysPerUseSnapshot: 0,
      plan: { id: 'plan-1', freezeAllowedCount: 0, freezeMaxDaysPerUse: 0 },
    });
    userPackage.findFirst.mockResolvedValue(loaded);
    userPackage.findUnique.mockResolvedValue(loaded);
    const service = new PackagesFreezeService(prisma as never);

    await expect(service.freezeForUser('user-1', 'pkg-1', 1)).rejects.toMatchObject({
      message: FREEZE_ERROR.NOT_ALLOWED,
    });
  });

  it('returns not found when the client does not own the package', async () => {
    const { prisma, userPackage } = createPrisma();
    userPackage.findFirst.mockResolvedValue(null);
    const service = new PackagesFreezeService(prisma as never);

    await expect(service.freezeForUser('user-1', 'pkg-1', 3)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('unfreezes a paused package and returns the active state', async () => {
    const { prisma, userPackage, userPackageFreeze } = createPrisma();
    const pausedAt = new Date('2026-08-10T10:00:00.000Z');
    const paused = createLoadedPackage({
      status: UserPackageStatus.PAUSED,
      freezesUsedCount: 1,
      pausedAt,
      pausedUntil: new Date('2026-08-17T10:00:00.000Z'),
    });
    const active = {
      ...paused,
      status: UserPackageStatus.ACTIVE,
      pausedAt: null,
      pausedUntil: null,
      currentPeriodEnd: new Date('2026-09-13T10:00:00.000Z'),
    };
    userPackage.findFirst.mockResolvedValue(paused);
    userPackage.findUnique
      .mockResolvedValueOnce(paused)
      .mockResolvedValueOnce(active);
    userPackageFreeze.findFirst.mockResolvedValue({
      id: 'freeze-1',
      userPackageId: 'pkg-1',
      startedAt: pausedAt,
      scheduledEndAt: new Date('2026-08-17T10:00:00.000Z'),
      status: UserPackageFreezeStatus.ACTIVE,
    });
    const service = new PackagesFreezeService(prisma as never);

    const result = await service.unfreezeForUser('user-1', 'pkg-1');
    expect(result.status).toBe(UserPackageStatus.ACTIVE);
    expect(result.freeze.canUnfreeze).toBe(false);
    expect(userPackage.update).toHaveBeenCalled();
  });

  it('lets admin freeze with the same limit rules', async () => {
    const { prisma, userPackage, userPackageFreeze } = createPrisma();
    const loaded = createLoadedPackage();
    const paused = {
      ...loaded,
      status: UserPackageStatus.PAUSED,
      freezesUsedCount: 1,
    };
    userPackage.findUnique.mockResolvedValue(loaded);
    userPackage.update.mockResolvedValue(paused);
    const service = new PackagesFreezeService(prisma as never);

    const result = await service.freezeForAdmin('admin-1', 'pkg-1', 2);
    expect(userPackageFreeze.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        initiatedBy: UserPackageFreezeInitiator.ADMIN,
        initiatedByUserId: 'admin-1',
        daysRequested: 2,
      }),
    });
    expect(result.status).toBe(UserPackageStatus.PAUSED);
  });
});
