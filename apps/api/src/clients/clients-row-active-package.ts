import { UserPackageStatus } from '@prisma/client';
import { resolveUserPackagePlan } from '../packages/user-package-plan-snapshot.util';

export const CLIENT_ACTIVE_PACKAGE_STATUSES = [
  UserPackageStatus.ACTIVE,
  UserPackageStatus.PENDING,
  UserPackageStatus.PAUSED,
] as const;

/** Packages shown on the clients list membership column (includes expired). */
export const CLIENT_LIST_PACKAGE_STATUSES = [
  ...CLIENT_ACTIVE_PACKAGE_STATUSES,
  UserPackageStatus.EXPIRED,
] as const;

export const clientActivePackagePlanSelect = {
  id: true,
  name: true,
  categoryName: true,
  priceCents: true,
  periodDays: true,
  isUnlimited: true,
  sessionsPerMonth: true,
} as const;

export type ClientActivePackagePlan = {
  id: string;
  name: string;
  categoryName: string;
  priceCents: number;
  periodDays: number;
  isUnlimited: boolean;
  sessionsPerMonth: number | null;
};

export type ClientActivePackageCandidate = {
  id: string;
  status: UserPackageStatus;
  currentPeriodEnd: Date;
  plan: ClientActivePackagePlan | null;
  sourcePlanIdSnapshot: string;
  planNameSnapshot: string;
  planCategoryNameSnapshot: string;
  planPriceCentsSnapshot: number;
  planPeriodDaysSnapshot: number;
  planIsUnlimitedSnapshot: boolean;
  planSessionsPerMonthSnapshot: number | null;
};

export type ClientActivePackageFields = {
  activePlanName: string | null;
  activePlanCostCents: number | null;
  activePlanExpiresAt: string | null;
  activePackageId: string | null;
  activePackageStatus: UserPackageStatus | null;
};

const STATUS_PRIORITY: Record<UserPackageStatus, number> = {
  [UserPackageStatus.ACTIVE]: 0,
  [UserPackageStatus.PENDING]: 1,
  [UserPackageStatus.PAUSED]: 2,
  [UserPackageStatus.EXPIRED]: 3,
  [UserPackageStatus.CANCELLED]: 4,
};

function emptyActivePackageFields(): ClientActivePackageFields {
  return {
    activePlanName: null,
    activePlanCostCents: null,
    activePlanExpiresAt: null,
    activePackageId: null,
    activePackageStatus: null,
  };
}

/**
 * Picks the membership to show on Finance → Members (ACTIVE > PENDING > PAUSED).
 * Prefers packages still in their current period when any exist.
 */
export function pickClientActivePackage(
  packages: readonly ClientActivePackageCandidate[],
  nowMs: number = Date.now(),
): ClientActivePackageCandidate | null {
  if (packages.length === 0) {
    return null;
  }
  const inPeriod = packages.filter(
    (pkg) => pkg.currentPeriodEnd.getTime() > nowMs,
  );
  const pool = inPeriod.length > 0 ? inPeriod : [...packages];
  return (
    [...pool].sort((a, b) => {
      const byStatus = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
      if (byStatus !== 0) {
        return byStatus;
      }
      return b.currentPeriodEnd.getTime() - a.currentPeriodEnd.getTime();
    })[0] ?? null
  );
}

export function toClientActivePackageFields(
  packages: readonly ClientActivePackageCandidate[],
  nowMs: number = Date.now(),
): ClientActivePackageFields {
  const selected = pickClientActivePackage(packages, nowMs);
  if (selected === null) {
    return emptyActivePackageFields();
  }
  const resolvedPlan = resolveUserPackagePlan({
    plan: selected.plan,
    snapshots: selected,
  });
  return {
    activePlanName: resolvedPlan.name,
    activePlanCostCents: resolvedPlan.priceCents,
    activePlanExpiresAt: selected.currentPeriodEnd.toISOString().slice(0, 10),
    activePackageId: selected.id,
    activePackageStatus: selected.status,
  };
}
