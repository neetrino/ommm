import { BadRequestException } from '@nestjs/common';
import type { UserPackage } from '@prisma/client';
import {
  resolveUserPackagePlanCategoryName,
  resolveUserPackagePlanIsUnlimited,
  type UserPackagePlanSnapshotFields,
} from './user-package-plan-snapshot.util';

export type PackageUsageStats = {
  totalSessions: number | null;
  usedSessions: number | null;
  remainingSessions: number | null;
  isUnlimited: boolean;
};

export type EligibleBookingPackage = {
  userPackageId: string;
  planId: string;
  planName: string;
  remainingSessions: number | null;
  totalSessions: number | null;
  usedSessions: number | null;
  isUnlimited: boolean;
  canBook: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  includedCategories: string[];
};

export type SessionShape = {
  id: string;
  classType: {
    id: string;
    name: string;
  };
};

export type UserPackageWithPlanAndBalances = UserPackage &
  UserPackagePlanSnapshotFields & {
    plan: {
      id: string;
      name: string;
      categoryName: string;
      isUnlimited: boolean;
    } | null;
    balances: Array<{
      id: string;
      sourceCategoryNameSnapshot: string;
      sessionsTotal: number | null;
      sessionsUsed: number;
      sessionsRemaining: number | null;
      isUnlimited: boolean;
    }>;
  };

export function computeUsageStats(membership: {
  sessionsTotal: number | null;
  sessionsRemaining: number | null;
  plan: { isUnlimited: boolean } | null;
  planIsUnlimitedSnapshot: boolean;
}): PackageUsageStats {
  const totalSessions = membership.sessionsTotal;
  const remainingSessions = membership.sessionsRemaining;
  const isUnlimited = resolveUserPackagePlanIsUnlimited(membership);
  const usedSessions =
    totalSessions === null || remainingSessions === null
      ? null
      : Math.max(totalSessions - remainingSessions, 0);
  return {
    totalSessions,
    usedSessions,
    remainingSessions,
    isUnlimited,
  };
}

export function resolveInitialSessions(plan: {
  isUnlimited: boolean;
  sessionsPerMonth: number | null;
}): { sessionsTotal: number | null; sessionsRemaining: number | null } {
  if (plan.isUnlimited) {
    return { sessionsTotal: null, sessionsRemaining: null };
  }
  const total = plan.sessionsPerMonth ?? 0;
  return { sessionsTotal: total, sessionsRemaining: total };
}

export function toEligibleBookingPackage(
  membership: UserPackageWithPlanAndBalances,
  classTypeName: string,
): EligibleBookingPackage {
  const usage = computeUsageStats(membership);
  const includedCategories = Array.from(
    new Set(
      membership.balances
        .map((balance) => balance.sourceCategoryNameSnapshot.trim())
        .filter((value) => value.length > 0),
    ),
  );
  return {
    userPackageId: membership.id,
    planId: membership.plan?.id ?? membership.sourcePlanIdSnapshot,
    planName: membership.plan?.name ?? membership.planNameSnapshot,
    remainingSessions: usage.remainingSessions,
    totalSessions: usage.totalSessions,
    usedSessions: usage.usedSessions,
    isUnlimited: usage.isUnlimited,
    canBook: hasAnyBookableCredit(membership, classTypeName),
    currentPeriodStart: membership.currentPeriodStart.toISOString(),
    currentPeriodEnd: membership.currentPeriodEnd.toISOString(),
    includedCategories,
  };
}

export function membershipCoversSessionType(
  membership: UserPackageWithPlanAndBalances,
  classTypeName: string,
): boolean {
  const normalized = classTypeName.trim().toLowerCase();
  if (normalized.length === 0) {
    return false;
  }
  if (membership.balances.length > 1) {
    return membership.balances.some(
      (balance) =>
        balance.sourceCategoryNameSnapshot.trim().toLowerCase() === normalized,
    );
  }
  const categoryName = resolveUserPackagePlanCategoryName({
    plan: membership.plan,
    planCategoryNameSnapshot: membership.planCategoryNameSnapshot,
    balances: membership.balances,
  });
  return categoryName.trim().toLowerCase() === normalized;
}

export function hasAnyBookableCredit(
  membership: UserPackageWithPlanAndBalances,
  classTypeName: string,
): boolean {
  const balance = pickBalanceForCategory(membership, classTypeName);
  if (balance === null) {
    return false;
  }
  if (balance.isUnlimited || balance.sessionsRemaining === null) {
    return true;
  }
  return balance.sessionsRemaining > 0;
}

export function pickBalanceForCategory(
  membership: UserPackageWithPlanAndBalances,
  classTypeName: string,
) {
  const normalized = classTypeName.trim().toLowerCase();
  const exact = membership.balances.find(
    (balance) =>
      balance.sourceCategoryNameSnapshot.trim().toLowerCase() === normalized,
  );
  if (exact !== undefined) {
    return exact;
  }
  if (membership.balances.length > 1) {
    return null;
  }
  return membership.balances[0] ?? null;
}

export function assertPositiveRequiredSessions(requiredSessions: number): void {
  if (requiredSessions <= 0) {
    return;
  }
}

export function assertSufficientBalance(
  balanceRemaining: number | null,
  requiredSessions: number,
): void {
  if (balanceRemaining !== null && balanceRemaining < requiredSessions) {
    throw new BadRequestException('Selected package has no remaining sessions');
  }
}
