import { PaymentSource, type Prisma } from '@prisma/client';
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

/**
 * Resolves UserPackage ids for package-payment filters.
 * Returns `null` when no package filters are set; empty array means match nothing.
 */
export async function resolveAdminPaymentPackageSourceIds(
  prisma: PackageFilterPrisma,
  query: PackagePlanFilterSlice,
): Promise<string[] | null> {
  if (!hasAdminPaymentPackageFilters(query)) {
    return null;
  }

  const sessionsWhere =
    query.sessions && query.sessions.length > 0
      ? buildSessionsPlanWhere(query.sessions)
      : null;
  if (query.sessions && query.sessions.length > 0 && sessionsWhere === null) {
    return [];
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
    return [];
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
  return userPackages.map((row) => row.id);
}

export function packageSourceIdsToPaymentWhere(
  sourceIds: string[] | null,
): Prisma.PaymentWhereInput | null {
  if (sourceIds === null) {
    return null;
  }
  if (sourceIds.length === 0) {
    return { id: '__no_package_payment_match__' };
  }
  return {
    source: PaymentSource.PACKAGE,
    sourceId: sourceIds.length === 1 ? sourceIds[0]! : { in: sourceIds },
  };
}
