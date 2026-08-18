import type { PackagePlan, UserPackage, UserPackageStatus } from '@prisma/client';
import {
  canStartFreeze,
  resolveFreezeCounters,
  resolveFreezePolicy,
} from './packages-freeze.helpers';

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
  userPackage: Pick<
    UserPackage,
    | 'status'
    | 'freezeAllowedCountSnapshot'
    | 'freezeMaxDaysPerUseSnapshot'
    | 'freezesUsedCount'
    | 'pausedAt'
    | 'pausedUntil'
  >,
  plan: Pick<PackagePlan, 'freezeAllowedCount' | 'freezeMaxDaysPerUse'> | null,
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
    canUnfreeze: userPackage.status === ('PAUSED' satisfies UserPackageStatus),
  };
}
