import { UserPackageStatus } from '@prisma/client';
import {
  USER_PACKAGE_FREEZE_STATUS,
  type PackagePlanFreezeFields,
  type UserPackageFreezeFields,
} from './packages-freeze.types';
import { USER_PACKAGE_VALIDITY_DAY_MS } from './packages-freeze.time';

export type FreezePolicy = {
  allowedCount: number;
  maxDaysPerUse: number;
};

export type FreezeCounters = {
  usedCount: number;
  remainingCount: number;
};

export function isEnabledFreezePolicy(policy: FreezePolicy): boolean {
  return policy.allowedCount > 0 && policy.maxDaysPerUse > 0;
}

export function resolveFreezePolicy(
  userPackage: Pick<
    UserPackageFreezeFields,
    'freezeAllowedCountSnapshot' | 'freezeMaxDaysPerUseSnapshot'
  >,
  plan: PackagePlanFreezeFields | null,
): FreezePolicy {
  const snapshot: FreezePolicy = {
    allowedCount: userPackage.freezeAllowedCountSnapshot,
    maxDaysPerUse: userPackage.freezeMaxDaysPerUseSnapshot,
  };
  if (isEnabledFreezePolicy(snapshot)) {
    return snapshot;
  }
  if (plan === null) {
    return { allowedCount: 0, maxDaysPerUse: 0 };
  }
  const live: FreezePolicy = {
    allowedCount: plan.freezeAllowedCount,
    maxDaysPerUse: plan.freezeMaxDaysPerUse,
  };
  if (isEnabledFreezePolicy(live)) {
    return live;
  }
  return { allowedCount: 0, maxDaysPerUse: 0 };
}

export function resolveFreezeCounters(
  usedCount: number,
  policy: FreezePolicy,
): FreezeCounters {
  const remainingCount = Math.max(0, policy.allowedCount - usedCount);
  return { usedCount, remainingCount };
}

export function canStartFreeze(params: {
  status: UserPackageStatus;
  remainingCount: number;
  policy: FreezePolicy;
}): boolean {
  return (
    params.status === UserPackageStatus.ACTIVE &&
    isEnabledFreezePolicy(params.policy) &&
    params.remainingCount > 0
  );
}

export function addDaysUtc(start: Date, days: number): Date {
  return new Date(start.getTime() + days * USER_PACKAGE_VALIDITY_DAY_MS);
}

export function resolveFreezeExtensionMs(params: {
  startedAt: Date;
  endedAt: Date;
  scheduledEndAt: Date;
}): number {
  const endMs = Math.min(
    params.endedAt.getTime(),
    params.scheduledEndAt.getTime(),
  );
  return Math.max(0, endMs - params.startedAt.getTime());
}

export function buildFreezeResumeData(params: {
  currentPeriodEnd: Date;
  startedAt: Date;
  endedAt: Date;
  scheduledEndAt: Date;
}): {
  status: typeof UserPackageStatus.ACTIVE;
  currentPeriodEnd: Date;
  pausedAt: null;
  pausedUntil: null;
  freezeEndedAt: Date;
  freezeStatus: typeof USER_PACKAGE_FREEZE_STATUS.COMPLETED;
} {
  const extensionMs = resolveFreezeExtensionMs(params);
  return {
    status: UserPackageStatus.ACTIVE,
    currentPeriodEnd: new Date(params.currentPeriodEnd.getTime() + extensionMs),
    pausedAt: null,
    pausedUntil: null,
    freezeEndedAt: params.endedAt,
    freezeStatus: USER_PACKAGE_FREEZE_STATUS.COMPLETED,
  };
}
