import type { Prisma, PrismaClient } from '@prisma/client';
import {
  buildTokenAndWhere,
  containsInsensitive,
  splitSearchTokens,
  userContainsToken,
} from '../common/token-text-search';
import { SOLD_PACKAGE_PAYMENTS_WHERE } from './packages-admin-stats';

const SOLD_PACKAGES_DEFAULT_PAGE_SIZE = 25;

const UNNAMED_SOLD_PACKAGE = '—';

export type SoldPackageListItem = {
  id: string;
  createdAt: Date;
  amountCents: number;
  currency: string;
  packageName: string;
  user: {
    id: string;
    name: string | null;
    lastName: string | null;
    email: string;
  };
};

export type SoldPackageListPayload = {
  items: SoldPackageListItem[];
  total: number;
  totalAmountCents: number;
  take: number;
  offset: number;
};

type SoldPaymentRow = {
  id: string;
  createdAt: Date;
  amountCents: number;
  currency: string;
  sourceId: string | null;
  description: string | null;
  user: SoldPackageListItem['user'];
};

type ListSoldPackagesQuery = {
  take?: number;
  offset?: number;
  q?: string;
  planId?: string;
  categorySlug?: string;
};

export async function listSoldPackages(
  prisma: PrismaClient,
  query: ListSoldPackagesQuery,
): Promise<SoldPackageListPayload> {
  const take = query.take ?? SOLD_PACKAGES_DEFAULT_PAGE_SIZE;
  const offset = query.offset ?? 0;
  const where = await buildSoldListWhere(prisma, query);

  const [payments, total, amountAgg] = await Promise.all([
    prisma.payment.findMany({
      where,
      select: {
        id: true,
        createdAt: true,
        amountCents: true,
        currency: true,
        sourceId: true,
        description: true,
        user: {
          select: { id: true, name: true, lastName: true, email: true },
        },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
      skip: offset,
    }),
    prisma.payment.count({ where }),
    prisma.payment.aggregate({
      where,
      _sum: { amountCents: true },
    }),
  ]);

  const packageNames = await loadSoldPackageNames(
    prisma,
    payments.map((payment) => payment.sourceId),
  );

  return {
    items: payments.map((payment) => toSoldListItem(payment, packageNames)),
    total,
    totalAmountCents: amountAgg._sum.amountCents ?? 0,
    take,
    offset,
  };
}

async function buildSoldListWhere(
  prisma: PrismaClient,
  query: ListSoldPackagesQuery,
): Promise<Prisma.PaymentWhereInput> {
  const searchWhere = await buildSoldPackageSearchWhere(prisma, query.q);
  const planWhere = await buildSoldPackagePlanWhere(prisma, query.planId);
  const categoryWhere = await buildSoldPackageCategoryWhere(
    prisma,
    query.categorySlug,
  );
  return {
    AND: [
      SOLD_PACKAGE_PAYMENTS_WHERE,
      ...(searchWhere ? [searchWhere] : []),
      ...(planWhere ? [planWhere] : []),
      ...(categoryWhere ? [categoryWhere] : []),
    ],
  };
}

async function buildSoldPackagePlanWhere(
  prisma: PrismaClient,
  planId: string | undefined,
): Promise<Prisma.PaymentWhereInput | undefined> {
  const id = planId?.trim() ?? '';
  if (id.length === 0 || id === 'all') {
    return undefined;
  }
  const rows = await prisma.userPackage.findMany({
    where: {
      OR: [{ planId: id }, { sourcePlanIdSnapshot: id }],
    },
    select: { id: true },
  });
  return { sourceId: { in: rows.map((row) => row.id) } };
}

async function buildSoldPackageCategoryWhere(
  prisma: PrismaClient,
  categorySlug: string | undefined,
): Promise<Prisma.PaymentWhereInput | undefined> {
  const slug = categorySlug?.trim() ?? '';
  if (slug.length === 0 || slug === 'all') {
    return undefined;
  }
  const matchingIds = await loadUserPackageIdsForCategory(prisma, slug);
  return { sourceId: { in: matchingIds } };
}

async function loadUserPackageIdsForCategory(
  prisma: PrismaClient,
  categorySlug: string,
): Promise<string[]> {
  const plans = await prisma.packagePlan.findMany({
    where: { categorySlug },
    select: { id: true, categoryName: true },
  });
  const planIds = plans.map((plan) => plan.id);
  const categoryNames = uniqueNonEmpty(
    plans.map((plan) => plan.categoryName),
  );
  const rows = await prisma.userPackage.findMany({
    where: {
      OR: [
        { plan: { categorySlug } },
        ...(planIds.length > 0
          ? [{ sourcePlanIdSnapshot: { in: planIds } }]
          : []),
        ...(categoryNames.length > 0
          ? [{ planCategoryNameSnapshot: { in: categoryNames } }]
          : []),
      ],
    },
    select: { id: true },
  });
  return rows.map((row) => row.id);
}

function uniqueNonEmpty(values: readonly string[]): string[] {
  return [
    ...new Set(
      values.map((value) => value.trim()).filter((value) => value.length > 0),
    ),
  ];
}

async function buildSoldPackageSearchWhere(
  prisma: PrismaClient,
  rawQuery: string | undefined,
): Promise<Prisma.PaymentWhereInput | undefined> {
  const tokens = splitSearchTokens(rawQuery);
  if (tokens.length === 0) {
    return undefined;
  }
  const idsByToken = await loadMatchingPackageIdsByToken(prisma, tokens);
  return buildTokenAndWhere(rawQuery, (token) =>
    matchSoldPackageToken(token, idsByToken.get(token) ?? []),
  );
}

function matchSoldPackageToken(
  token: string,
  matchingPackageIds: readonly string[],
): Prisma.PaymentWhereInput {
  const sourceMatch =
    matchingPackageIds.length > 0
      ? [{ sourceId: { in: [...matchingPackageIds] } }]
      : [];
  return {
    OR: [
      { user: userContainsToken(token) },
      { description: containsInsensitive(token) },
      ...sourceMatch,
    ],
  };
}

async function loadMatchingPackageIdsByToken(
  prisma: PrismaClient,
  tokens: readonly string[],
): Promise<Map<string, string[]>> {
  const entries = await Promise.all(
    tokens.map(async (token) => {
      const rows = await prisma.userPackage.findMany({
        where: {
          OR: [
            { planNameSnapshot: containsInsensitive(token) },
            { plan: { name: containsInsensitive(token) } },
          ],
        },
        select: { id: true },
      });
      return [token, rows.map((row) => row.id)] as const;
    }),
  );
  return new Map(entries);
}

async function loadSoldPackageNames(
  prisma: PrismaClient,
  sourceIds: readonly (string | null)[],
): Promise<Map<string, string>> {
  const userPackageIds = sourceIds.filter((id): id is string => id !== null);
  if (userPackageIds.length === 0) {
    return new Map();
  }

  const userPackages = await prisma.userPackage.findMany({
    where: { id: { in: userPackageIds } },
    select: {
      id: true,
      planNameSnapshot: true,
      plan: { select: { name: true } },
    },
  });

  return new Map(
    userPackages.map((userPackage) => [
      userPackage.id,
      userPackage.plan?.name ?? userPackage.planNameSnapshot,
    ]),
  );
}

function toSoldListItem(
  payment: SoldPaymentRow,
  packageNames: Map<string, string>,
): SoldPackageListItem {
  return {
    id: payment.id,
    createdAt: payment.createdAt,
    amountCents: payment.amountCents,
    currency: payment.currency,
    packageName: resolveSoldPackageName(
      payment.sourceId,
      payment.description,
      packageNames,
    ),
    user: payment.user,
  };
}

function resolveSoldPackageName(
  sourceId: string | null,
  description: string | null,
  packageNames: Map<string, string>,
): string {
  if (sourceId !== null) {
    const named = packageNames.get(sourceId);
    if (named && named.trim().length > 0) {
      return named;
    }
  }
  const fallback = description?.trim() ?? '';
  return fallback.length > 0 ? fallback : UNNAMED_SOLD_PACKAGE;
}
