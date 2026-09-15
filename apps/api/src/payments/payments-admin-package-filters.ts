import { PaymentSource, type Prisma } from '@prisma/client';
import { PACKAGE_PAYMENT_PLAN_ID_KEY } from '../packages/package-payment-metadata.util';
import type { AdminListPaymentsQueryDto } from './dto/admin-list-payments-query.dto';

type PackagePlanFilterSlice = Pick<
  AdminListPaymentsQueryDto,
  'planId' | 'packageClass' | 'sessions'
>;

type PackageFilterPrisma = {
  packagePlan: {
    findMany: (args: {
      where: Prisma.PackagePlanWhereInput;
      select: { id: true };
    }) => Promise<Array<{ id: string }>>;
  };
  userPackage: {
    findMany: (args: {
      where: Prisma.UserPackageWhereInput;
      select: { id: true };
    }) => Promise<Array<{ id: string }>>;
  };
};

export function hasAdminPaymentPackageFilters(
  query: PackagePlanFilterSlice,
): boolean {
  return (
    (query.planId?.length ?? 0) > 0 ||
    (query.packageClass?.length ?? 0) > 0 ||
    (query.sessions?.length ?? 0) > 0
  );
}

function buildSessionsPlanWhere(
  sessions: readonly string[],
): Prisma.PackagePlanWhereInput | null {
  const clauses: Prisma.PackagePlanWhereInput[] = [];
  for (const part of sessions) {
    if (part === 'unlimited') {
      clauses.push({ isUnlimited: true });
      continue;
    }
    const count = Number.parseInt(part, 10);
    if (Number.isInteger(count) && count > 0 && String(count) === part) {
      clauses.push({ isUnlimited: false, sessionsPerMonth: count });
    }
  }
  return clauses.length > 0 ? { OR: clauses } : null;
}

export type AdminPaymentPackageFilterResolution = {
  /** UserPackage ids linked to matching plans (may be empty). */
  sourceIds: string[];
  /** Package plan ids that matched the filter (for metadata.planId fallback). */
  planIds: string[];
};

/**
 * Resolves UserPackage ids + matching plan ids for package-payment filters.
 * Returns `null` when no package filters are set.
 */
export async function resolveAdminPaymentPackageSourceIds(
  prisma: PackageFilterPrisma,
  query: PackagePlanFilterSlice,
): Promise<AdminPaymentPackageFilterResolution | null> {
  if (!hasAdminPaymentPackageFilters(query)) {
    return null;
  }

  const sessionsWhere =
    query.sessions && query.sessions.length > 0
      ? buildSessionsPlanWhere(query.sessions)
      : null;
  if (query.sessions && query.sessions.length > 0 && sessionsWhere === null) {
    return { sourceIds: [], planIds: [] };
  }

  const plans = await prisma.packagePlan.findMany({
    where: {
      ...(query.planId && query.planId.length > 0
        ? { id: { in: query.planId } }
        : {}),
      ...(query.packageClass && query.packageClass.length > 0
        ? { categoryName: { in: query.packageClass } }
        : {}),
      ...(sessionsWhere ?? {}),
    },
    select: { id: true },
  });
  const planIds = plans.map((plan) => plan.id);
  if (planIds.length === 0) {
    return { sourceIds: [], planIds: [] };
  }

  const userPackages = await prisma.userPackage.findMany({
    where: {
      OR: [
        { planId: { in: planIds } },
        { sourcePlanIdSnapshot: { in: planIds } },
      ],
    },
    select: { id: true },
  });
  return {
    sourceIds: userPackages.map((row) => row.id),
    planIds,
  };
}

/** Prisma where for package payments by UserPackage id and/or metadata.planId. */
export function packageSourceIdsToPaymentWhere(
  resolution: AdminPaymentPackageFilterResolution | null,
): Prisma.PaymentWhereInput | null {
  if (resolution === null) {
    return null;
  }
  const { sourceIds, planIds } = resolution;
  if (sourceIds.length === 0 && planIds.length === 0) {
    return { id: '__no_package_payment_match__' };
  }

  const clauses: Prisma.PaymentWhereInput[] = [];
  if (sourceIds.length === 1) {
    clauses.push({ sourceId: sourceIds[0] });
  } else if (sourceIds.length > 1) {
    clauses.push({ sourceId: { in: sourceIds } });
  }
  for (const planId of planIds) {
    clauses.push({
      metadata: { path: [PACKAGE_PAYMENT_PLAN_ID_KEY], equals: planId },
    });
  }

  if (clauses.length === 1) {
    return { source: PaymentSource.PACKAGE, ...clauses[0] };
  }
  return {
    source: PaymentSource.PACKAGE,
    OR: clauses,
  };
}
