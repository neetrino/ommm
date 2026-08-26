import { UserPackageStatus } from '@prisma/client';
import {
  addDaysUtc,
  buildFreezeResumeData,
  canAdminStartFreeze,
  canStartFreeze,
  resolveAdminFreezeMaxDays,
  resolveFreezeCounters,
  resolveFreezeExtensionMs,
  resolveFreezePolicy,
} from './packages-freeze.helpers';
import { MAX_FREEZE_DAYS_PER_USE } from './packages-freeze.constants';
import { USER_PACKAGE_VALIDITY_DAY_MS } from './packages-freeze.time';

describe('packages-freeze.helpers', () => {
  it('prefers a snapshot policy when it is enabled', () => {
    expect(
      resolveFreezePolicy(
        {
          freezeAllowedCountSnapshot: 1,
          freezeMaxDaysPerUseSnapshot: 7,
        },
        { freezeAllowedCount: 2, freezeMaxDaysPerUse: 14 },
      ),
    ).toEqual({ allowedCount: 1, maxDaysPerUse: 7 });
  });

  it('falls back to the live plan when the snapshot is unused', () => {
    expect(
      resolveFreezePolicy(
        {
          freezeAllowedCountSnapshot: 0,
          freezeMaxDaysPerUseSnapshot: 0,
        },
        { freezeAllowedCount: 2, freezeMaxDaysPerUse: 14 },
      ),
    ).toEqual({ allowedCount: 2, maxDaysPerUse: 14 });
  });

  it('counts remaining freezes and blocks a second use', () => {
    const policy = { allowedCount: 1, maxDaysPerUse: 7 };
    expect(resolveFreezeCounters(0, policy)).toEqual({
      usedCount: 0,
      remainingCount: 1,
    });
    expect(
      canStartFreeze({
        status: UserPackageStatus.ACTIVE,
        remainingCount: 0,
        policy,
      }),
    ).toBe(false);
  });

  it('lets an admin freeze an active package even without a plan policy', () => {
    expect(canAdminStartFreeze(UserPackageStatus.ACTIVE)).toBe(true);
    expect(canAdminStartFreeze(UserPackageStatus.PAUSED)).toBe(false);
    expect(
      resolveAdminFreezeMaxDays({ allowedCount: 0, maxDaysPerUse: 0 }),
    ).toBe(MAX_FREEZE_DAYS_PER_USE);
    expect(
      resolveAdminFreezeMaxDays({ allowedCount: 1, maxDaysPerUse: 7 }),
    ).toBe(7);
  });

  it('extends validity by the elapsed pause, never past the scheduled end', () => {
    const startedAt = new Date('2026-08-01T00:00:00.000Z');
    const scheduledEndAt = addDaysUtc(startedAt, 7);
    expect(
      resolveFreezeExtensionMs({
        startedAt,
        endedAt: addDaysUtc(startedAt, 3),
        scheduledEndAt,
      }),
    ).toBe(3 * USER_PACKAGE_VALIDITY_DAY_MS);
    expect(
      resolveFreezeExtensionMs({
        startedAt,
        endedAt: addDaysUtc(startedAt, 10),
        scheduledEndAt,
      }),
    ).toBe(7 * USER_PACKAGE_VALIDITY_DAY_MS);
  });

  it('builds resume data that reactivates the package after a full freeze', () => {
    const startedAt = new Date('2026-08-01T00:00:00.000Z');
    const scheduledEndAt = addDaysUtc(startedAt, 7);
    const currentPeriodEnd = new Date('2026-08-20T00:00:00.000Z');
    const next = buildFreezeResumeData({
      currentPeriodEnd,
      startedAt,
      endedAt: scheduledEndAt,
      scheduledEndAt,
    });
    expect(next.status).toBe(UserPackageStatus.ACTIVE);
    expect(next.currentPeriodEnd.getTime()).toBe(
      currentPeriodEnd.getTime() + 7 * USER_PACKAGE_VALIDITY_DAY_MS,
    );
    expect(next.pausedAt).toBeNull();
    expect(next.pausedUntil).toBeNull();
  });
});
