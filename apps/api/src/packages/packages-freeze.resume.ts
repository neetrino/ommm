import { UserPackageStatus } from '@prisma/client';
import { buildFreezeResumeData } from './packages-freeze.helpers';
import {
  USER_PACKAGE_FREEZE_STATUS,
  type FreezeResumeClient,
  type ResumableUserPackage,
} from './packages-freeze.types';

export type { FreezeResumeClient } from './packages-freeze.types';

const DUE_FREEZE_BATCH_SIZE = 100;

/**
 * Completes due freezes and extends validity by the paused duration.
 * Returns how many packages were resumed.
 */
export async function resumeDueFreezes(
  db: FreezeResumeClient,
  params?: { userId?: string; now?: Date },
): Promise<number> {
  const now = params?.now ?? new Date();
  const due = await db.userPackage.findMany({
    where: {
      ...(params?.userId !== undefined ? { userId: params.userId } : {}),
      status: UserPackageStatus.PAUSED,
      pausedUntil: { lte: now },
    },
    include: {
      freezes: {
        where: { status: USER_PACKAGE_FREEZE_STATUS.ACTIVE },
        orderBy: { startedAt: 'desc' },
        take: 1,
      },
    },
    take: DUE_FREEZE_BATCH_SIZE,
  });

  let resumed = 0;
  for (const userPackage of due) {
    await applyFreezeResume(db, userPackage, now);
    resumed += 1;
  }
  return resumed;
}

/** Completes the active freeze and extends validity by elapsed pause time. */
export async function applyFreezeResume(
  db: FreezeResumeClient,
  userPackage: ResumableUserPackage,
  endedAt: Date,
): Promise<void> {
  const activeFreeze = userPackage.freezes?.[0];
  if (activeFreeze === undefined) {
    await db.userPackage.update({
      where: { id: userPackage.id },
      data: {
        status: UserPackageStatus.ACTIVE,
        pausedAt: null,
        pausedUntil: null,
      },
    });
    return;
  }
  const next = buildFreezeResumeData({
    currentPeriodEnd: userPackage.currentPeriodEnd,
    startedAt: activeFreeze.startedAt,
    endedAt,
    scheduledEndAt: activeFreeze.scheduledEndAt,
  });
  await db.userPackageFreeze.update({
    where: { id: activeFreeze.id },
    data: {
      status: next.freezeStatus,
      endedAt: next.freezeEndedAt,
    },
  });
  await db.userPackage.update({
    where: { id: userPackage.id },
    data: {
      status: next.status,
      currentPeriodEnd: next.currentPeriodEnd,
      pausedAt: next.pausedAt,
      pausedUntil: next.pausedUntil,
    },
  });
}
