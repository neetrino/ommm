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

export type SessionClassTypeShape = {
  id: string;
  name: string;
};

export type SessionShape = {
  id: string;
  /** Session start — package period is validated against this, not wall-clock now. */
  startsAt: Date;
  classType: SessionClassTypeShape;
};

export type UserPackageBalanceShape = {
  id: string;
  classTypeId: string | null;
  sourceCategoryNameSnapshot: string;
  sessionsTotal: number | null;
  sessionsUsed: number;
  sessionsRemaining: number | null;
  isUnlimited: boolean;
};

export type UserPackageWithPlanAndBalances = UserPackage &
  UserPackagePlanSnapshotFields & {
    plan: {
      id: string;
      name: string;
      categoryName: string;
      isUnlimited: boolean;
    } | null;
    balances: UserPackageBalanceShape[];
  };

/** Whether a membership covers a session that starts at the given instant. */
export function isUserPackageActiveAt(
  membership: Pick<UserPackage, 'currentPeriodStart' | 'currentPeriodEnd'>,
  at: Date,
): boolean {
  return (
    membership.currentPeriodStart.getTime() <= at.getTime() &&
    membership.currentPeriodEnd.getTime() > at.getTime()
  );
}

/** Bookable while awaiting first visit, or inside the active period window. */
export function isUserPackageBookableAt(
  membership: Pick<
    UserPackage,
    'currentPeriodStart' | 'currentPeriodEnd' | 'awaitingFirstVisit'
  >,
  at: Date,
): boolean {
  if (membership.awaitingFirstVisit) {
    return true;
  }
  return isUserPackageActiveAt(membership, at);
}

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
  classType: SessionClassTypeShape,
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
    canBook: hasAnyBookableCredit(membership, classType),
    currentPeriodStart: membership.currentPeriodStart.toISOString(),
    currentPeriodEnd: membership.currentPeriodEnd.toISOString(),
    includedCategories,
  };
}

function balanceMatchesClassType(
  balance: UserPackageBalanceShape,
  classType: SessionClassTypeShape,
): boolean {
  if (balance.classTypeId !== null && balance.classTypeId.length > 0) {
    return balance.classTypeId === classType.id;
  }
  const normalized = classType.name.trim().toLowerCase();
  if (normalized.length === 0) {
    return false;
  }
  return balance.sourceCategoryNameSnapshot.trim().toLowerCase() === normalized;
}

export function membershipCoversSessionType(
  membership: UserPackageWithPlanAndBalances,
  classType: SessionClassTypeShape,
): boolean {
  if (membership.balances.length === 0) {
    return false;
  }
  if (membership.balances.some((balance) => balance.classTypeId !== null)) {
    return membership.balances.some((balance) =>
      balanceMatchesClassType(balance, classType),
    );
  }
  if (membership.balances.length > 1) {
    const normalized = classType.name.trim().toLowerCase();
    if (normalized.length === 0) {
      return false;
    }
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
  return (
    categoryName.trim().toLowerCase() === classType.name.trim().toLowerCase()
  );
}

export function hasAnyBookableCredit(
  membership: UserPackageWithPlanAndBalances,
  classType: SessionClassTypeShape,
): boolean {
  const balance = pickBalanceForCategory(membership, classType);
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
  classType: SessionClassTypeShape,
): UserPackageBalanceShape | null {
  const byId = membership.balances.find(
    (balance) =>
      balance.classTypeId !== null && balance.classTypeId === classType.id,
  );
  if (byId !== undefined) {
    return byId;
  }
  const hasTypedBalances = membership.balances.some(
    (balance) => balance.classTypeId !== null && balance.classTypeId.length > 0,
  );
  if (hasTypedBalances) {
    return null;
  }
  const normalized = classType.name.trim().toLowerCase();
  const byName = membership.balances.find(
    (balance) =>
      balance.sourceCategoryNameSnapshot.trim().toLowerCase() === normalized,
  );
  if (byName !== undefined) {
    return byName;
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
