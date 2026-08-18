import { UserPackageStatus } from '@prisma/client';
import {
  canStartFreeze,
  resolveFreezeCounters,
  resolveFreezePolicy,
} from './packages-freeze.helpers';
import type {
  PackagePlanFreezeFields,
  UserPackageFreezeFields,
} from './packages-freeze.types';

export type UserPackageFreezeApi = {
  allowedCount: number;
  maxDaysPerUse: number;
  usedCount: number;
  remainingCount: number;
  pausedAt: string | null;
  pausedUntil: string | null;
  canFreeze: boolean;
  canUnfreeze: boolean;
};

export function toUserPackageFreezeApi(
  userPackage: UserPackageFreezeFields,
  plan: PackagePlanFreezeFields | null,
): UserPackageFreezeApi {
  const policy = resolveFreezePolicy(userPackage, plan);
  const counters = resolveFreezeCounters(userPackage.freezesUsedCount, policy);
  return {
    allowedCount: policy.allowedCount,
    maxDaysPerUse: policy.maxDaysPerUse,
    usedCount: counters.usedCount,
    remainingCount: counters.remainingCount,
    pausedAt: userPackage.pausedAt?.toISOString() ?? null,
    pausedUntil: userPackage.pausedUntil?.toISOString() ?? null,
    canFreeze: canStartFreeze({
      status: userPackage.status,
      remainingCount: counters.remainingCount,
      policy,
    }),
    canUnfreeze: userPackage.status === UserPackageStatus.PAUSED,
  };
}
