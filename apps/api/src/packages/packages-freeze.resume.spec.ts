import { UserPackageStatus } from '@prisma/client';
import {
  USER_PACKAGE_FREEZE_INITIATOR,
  USER_PACKAGE_FREEZE_STATUS,
} from './packages-freeze.types';
import { addDaysUtc } from './packages-freeze.helpers';
import {
  applyFreezeResume,
  resumeDueFreezes,
  type FreezeResumeClient,
} from './packages-freeze.resume';
import { USER_PACKAGE_VALIDITY_DAY_MS } from './packages-freeze.time';

type FreezeResumeDb = FreezeResumeClient & {
  userPackage: {
    findMany: jest.Mock;
    update: jest.Mock;
  };
  userPackageFreeze: {
    update: jest.Mock;
  };
};

function createDb(): FreezeResumeDb {
  return {
    userPackage: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    userPackageFreeze: {
      update: jest.fn(),
    },
  };
}

function createActiveFreeze(startedAt: Date, days: number) {
  return {
    id: 'freeze-1',
    userPackageId: 'pkg-1',
    daysRequested: days,
    startedAt,
    scheduledEndAt: addDaysUtc(startedAt, days),
    endedAt: null,
    initiatedBy: USER_PACKAGE_FREEZE_INITIATOR.USER,
    initiatedByUserId: 'user-1',
    status: USER_PACKAGE_FREEZE_STATUS.ACTIVE,
    createdAt: startedAt,
    updatedAt: startedAt,
  };
}

describe('resumeDueFreezes', () => {
  it('resumes due paused packages and extends validity by the pause', async () => {
    const db = createDb();
    const startedAt = new Date('2026-08-01T00:00:00.000Z');
    const periodEnd = new Date('2026-08-20T00:00:00.000Z');
    const now = addDaysUtc(startedAt, 7);
    db.userPackage.findMany.mockResolvedValue([
      {
        id: 'pkg-1',
        currentPeriodEnd: periodEnd,
        freezes: [createActiveFreeze(startedAt, 7)],
      },
    ]);

    await expect(resumeDueFreezes(db, { now })).resolves.toBe(1);
    expect(db.userPackageFreeze.update).toHaveBeenCalledWith({
      where: { id: 'freeze-1' },
      data: {
        status: USER_PACKAGE_FREEZE_STATUS.COMPLETED,
        endedAt: now,
      },
    });
    expect(db.userPackage.update).toHaveBeenCalledWith({
      where: { id: 'pkg-1' },
      data: {
        status: UserPackageStatus.ACTIVE,
        currentPeriodEnd: new Date(
          periodEnd.getTime() + 7 * USER_PACKAGE_VALIDITY_DAY_MS,
        ),
        pausedAt: null,
        pausedUntil: null,
      },
    });
  });

  it('returns 0 when no freeze is due', async () => {
    const db = createDb();
    db.userPackage.findMany.mockResolvedValue([]);
    await expect(resumeDueFreezes(db)).resolves.toBe(0);
    expect(db.userPackage.update).not.toHaveBeenCalled();
  });
});

describe('applyFreezeResume', () => {
  it('unpauses a package that has no freeze row', async () => {
    const db = createDb();
    await applyFreezeResume(
      db,
      { id: 'pkg-1', currentPeriodEnd: new Date(), freezes: [] },
      new Date(),
    );
    expect(db.userPackage.update).toHaveBeenCalledWith({
      where: { id: 'pkg-1' },
      data: {
        status: UserPackageStatus.ACTIVE,
        pausedAt: null,
        pausedUntil: null,
      },
    });
    expect(db.userPackageFreeze.update).not.toHaveBeenCalled();
  });

  it('extends only the elapsed freeze when unfrozen early', async () => {
    const db = createDb();
    const startedAt = new Date('2026-08-01T00:00:00.000Z');
    const periodEnd = new Date('2026-08-20T00:00:00.000Z');
    const endedAt = addDaysUtc(startedAt, 3);
    await applyFreezeResume(
      db,
      {
        id: 'pkg-1',
        currentPeriodEnd: periodEnd,
        freezes: [createActiveFreeze(startedAt, 7)],
      },
      endedAt,
    );
    expect(db.userPackage.update).toHaveBeenCalledWith({
      where: { id: 'pkg-1' },
      data: {
        status: UserPackageStatus.ACTIVE,
        currentPeriodEnd: new Date(
          periodEnd.getTime() + 3 * USER_PACKAGE_VALIDITY_DAY_MS,
        ),
        pausedAt: null,
        pausedUntil: null,
      },
    });
  });
});
