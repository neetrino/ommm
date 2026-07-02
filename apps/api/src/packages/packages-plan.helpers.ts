import { BadRequestException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import type { PrismaService } from '../prisma/prisma.service';
import type { UpsertPackagePlanDto } from './dto/upsert-package-plan.dto';
import {
  CATEGORY_FALLBACK,
  DEFAULT_BILLING_PERIOD,
  type AdminPlanRecord,
  type PublicPlanSource,
  type ResolvedTypeSessionAllocations,
  type StoredTypeSessionAllocation,
} from './packages-plan.types';

export function toPublicPlan(
  plan: PublicPlanSource,
  classTypeNameById?: Map<string, string>,
) {
  return {
    ...plan,
    typeSessionAllocations: enrichStoredTypeSessionAllocations(
      plan.typeSessionAllocations,
      classTypeNameById,
    ),
    finalPriceCents: resolveFinalPriceCents(plan),
  };
}

export function toAdminPlanRow(plan: AdminPlanRecord) {
  return {
    id: plan.id,
    name: plan.name,
    categoryName: plan.categoryName,
    categorySlug: plan.categorySlug,
    classTypeId: plan.classTypeId ?? null,
    description: plan.description,
    priceCents: plan.priceCents,
    discountedPriceCents: plan.discountedPriceCents,
    pricePerSessionCents: plan.pricePerSessionCents,
    showPricePerSession: plan.showPricePerSession,
    currency: plan.currency,
    billingPeriod: plan.billingPeriod,
    periodDays: plan.periodDays,
    features: plan.features,
    buttonLabel: plan.buttonLabel,
    isPopular: plan.isPopular,
    isActive: plan.isActive,
    displayOrder: plan.displayOrder,
    sessionsPerMonth: plan.sessionsPerMonth,
    isUnlimited: plan.isUnlimited,
    guestCount: plan.guestCount,
    typeSessionAllocations: parseStoredTypeSessionAllocations(
      plan.typeSessionAllocations,
    ),
    createdAt: plan.createdAt.toISOString(),
  };
}

export function normalizeCategoryName(value: string | undefined): string {
  const next = value?.trim() ?? '';
  return next.length > 0 ? next : CATEGORY_FALLBACK;
}

export function normalizeSlug(value: string): string {
  const normalized = trimEdgeHyphens(
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-'),
  ).slice(0, 120);
  if (normalized.length > 0) {
    return normalized;
  }
  return `plan-${randomBytes(4).toString('hex')}`;
}

/** Unique slug for a new package group or plan row (display names may repeat). */
export function buildUniqueCategorySlug(baseName: string): string {
  const normalized = trimEdgeHyphens(
    baseName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-'),
  ).slice(0, 100);
  const prefix = normalized.length > 0 ? normalized : 'group';
  return `${prefix}-${randomBytes(4).toString('hex')}`.slice(0, 120);
}

export function trimEdgeHyphens(value: string): string {
  let start = 0;
  let end = value.length;
  while (start < end && value[start] === '-') {
    start += 1;
  }
  while (end > start && value[end - 1] === '-') {
    end -= 1;
  }
  return value.slice(start, end);
}

export function normalizeCurrency(value?: string): string {
  const next = value?.trim().toUpperCase();
  return next && next.length > 0 ? next : 'AMD';
}

export function normalizeNullableString(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeFeatures(value: string[] | undefined): string[] {
  if (value === undefined) {
    return [];
  }
  return value
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .slice(0, 20);
}

export function requireNonEmptyString(
  value: string | undefined,
  message: string,
): string {
  const next = value?.trim() ?? '';
  if (next.length === 0) {
    throw new BadRequestException(message);
  }
  return next;
}

export async function assertSlugUnique(
  prisma: PrismaService,
  slug: string,
  excludeId?: string,
): Promise<void> {
  const conflict = await prisma.packagePlan.findFirst({
    where: {
      slug,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });
  if (conflict !== null) {
    throw new BadRequestException('Package slug already exists');
  }
}

export async function resolveNextDisplayOrder(
  prisma: PrismaService,
  tx?: Prisma.TransactionClient,
): Promise<number> {
  const client = tx ?? prisma;
  const maxRow = await client.packagePlan.findFirst({
    orderBy: { displayOrder: 'desc' },
    select: { displayOrder: true },
  });
  return (maxRow?.displayOrder ?? 0) + 1;
}

export function assertDiscountBounds(
  priceCents: number,
  discountedPriceCents: number | null,
): void {
  if (discountedPriceCents === null) {
    return;
  }
  if (discountedPriceCents < 0 || discountedPriceCents >= priceCents) {
    throw new BadRequestException(
      'Discounted price must be non-negative and lower than full price',
    );
  }
}

export function resolveFinalPriceCents(plan: {
  priceCents: number;
  discountedPriceCents?: number | null;
}): number {
  if (
    typeof plan.discountedPriceCents === 'number' &&
    plan.discountedPriceCents >= 0 &&
    plan.discountedPriceCents < plan.priceCents
  ) {
    return plan.discountedPriceCents;
  }
  return plan.priceCents;
}

export function normalizeSessionsPerMonth(
  dto: UpsertPackagePlanDto,
): number | null {
  if (dto.isUnlimited === true) {
    return null;
  }
  if (dto.sessionsPerMonth === undefined) {
    return 0;
  }
  return dto.sessionsPerMonth;
}

export function createPaymentReference(prefix: string): string {
  return `${prefix}-${randomBytes(6).toString('hex').toUpperCase()}`;
}

export async function resolveClassTypeNameMapForAllocations(
  prisma: PrismaService,
  plans: readonly { typeSessionAllocations?: unknown }[],
): Promise<Map<string, string>> {
  const classTypeIds = new Set<string>();
  for (const plan of plans) {
    for (const allocation of parseStoredTypeSessionAllocations(
      plan.typeSessionAllocations,
    )) {
      classTypeIds.add(allocation.classTypeId);
    }
  }
  if (classTypeIds.size === 0) {
    return new Map();
  }
  const classTypes = await prisma.classType.findMany({
    where: { id: { in: [...classTypeIds] } },
    select: { id: true, name: true },
  });
  return new Map(
    classTypes.map((classType) => [classType.id, classType.name]),
  );
}

export function enrichStoredTypeSessionAllocations(
  value: unknown,
  classTypeNameById?: Map<string, string>,
): StoredTypeSessionAllocation[] {
  return parseStoredTypeSessionAllocations(value).map((allocation) => {
    const classTypeName = classTypeNameById?.get(allocation.classTypeId);
    return {
      ...allocation,
      ...(classTypeName !== undefined && classTypeName.trim().length > 0
        ? { classTypeName: classTypeName.trim() }
        : {}),
    };
  });
}

export function parseStoredTypeSessionAllocations(
  value: unknown,
): StoredTypeSessionAllocation[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const allocations: StoredTypeSessionAllocation[] = [];
  for (const item of value) {
    if (
      typeof item !== 'object' ||
      item === null ||
      !('classTypeId' in item) ||
      !('sessionCount' in item)
    ) {
      continue;
    }
    const record = item as Record<string, unknown>;
    const classTypeId = String(record.classTypeId).trim();
    const sessionCount = Number(record.sessionCount);
    if (
      classTypeId.length === 0 ||
      !Number.isInteger(sessionCount) ||
      sessionCount <= 0
    ) {
      continue;
    }
    allocations.push({
      classTypeId,
      sessionCount,
    });
  }
  return allocations;
}

export async function resolveTypeSessionAllocations(
  prisma: PrismaService,
  allocations: Array<{
    classTypeId: string;
    sessionCount: number;
  }>,
): Promise<ResolvedTypeSessionAllocations> {
  if (allocations.length === 0) {
    throw new BadRequestException(
      'At least one type session allocation is required',
    );
  }
  const classTypeIds = allocations.map((item) => item.classTypeId.trim());
  const uniqueClassTypeIds = new Set(classTypeIds);
  if (uniqueClassTypeIds.size !== classTypeIds.length) {
    throw new BadRequestException('Each type can appear only once');
  }
  if (classTypeIds.some((classTypeId) => classTypeId.length === 0)) {
    throw new BadRequestException('Type is required for every row');
  }
  if (
    allocations.some(
      (item) =>
        !Number.isInteger(item.sessionCount) || item.sessionCount <= 0,
    )
  ) {
    throw new BadRequestException(
      'Session count must be a positive whole number',
    );
  }
  const existingClassTypes = await prisma.classType.findMany({
    where: { id: { in: classTypeIds } },
    select: { id: true },
  });
  if (existingClassTypes.length !== classTypeIds.length) {
    throw new BadRequestException('One or more selected types are invalid');
  }
  const totalSessions = allocations.reduce(
    (sum, item) => sum + item.sessionCount,
    0,
  );
  return {
    allocations: allocations.map((item) => ({
      classTypeId: item.classTypeId.trim(),
      sessionCount: item.sessionCount,
    })),
    totalSessions,
    classTypeId: allocations.length === 1 ? allocations[0].classTypeId : null,
  };
}

export async function createBalancesForUserPackage(
  tx: Prisma.TransactionClient,
  params: { plan: AdminPlanRecord; userPackageId: string },
): Promise<void> {
  const typeAllocations = parseStoredTypeSessionAllocations(
    params.plan.typeSessionAllocations,
  );
  if (typeAllocations.length > 0) {
    const classTypes = await tx.classType.findMany({
      where: { id: { in: typeAllocations.map((item) => item.classTypeId) } },
      select: { id: true, name: true },
    });
    const classTypeNameById = new Map(
      classTypes.map((classType) => [classType.id, classType.name]),
    );
    for (const allocation of typeAllocations) {
      const classTypeName = classTypeNameById.get(allocation.classTypeId);
      if (classTypeName === undefined) {
        continue;
      }
      await (
        tx as unknown as {
          userPackageBalance: {
            create(args: unknown): Promise<unknown>;
          };
        }
      ).userPackageBalance.create({
        data: {
          userPackageId: params.userPackageId,
          sourcePlanId: params.plan.id,
          coverageKey: `${params.userPackageId}:${params.plan.id}:${allocation.classTypeId}`,
          sourcePackageNameSnapshot: params.plan.name,
          sourceCategoryNameSnapshot: classTypeName,
          sessionsTotal: allocation.sessionCount,
          sessionsRemaining: allocation.sessionCount,
          isUnlimited: false,
        },
      });
    }
    return;
  }
  await (
    tx as unknown as {
      userPackageBalance: {
        create(args: unknown): Promise<unknown>;
      };
    }
  ).userPackageBalance.create({
    data: {
      userPackageId: params.userPackageId,
      sourcePlanId: params.plan.id,
      coverageKey: `${params.userPackageId}:${params.plan.id}`,
      sourcePackageNameSnapshot: params.plan.name,
      sourceCategoryNameSnapshot: params.plan.categoryName,
      sessionsTotal: params.plan.isUnlimited
        ? null
        : (params.plan.sessionsPerMonth ?? 0),
      sessionsRemaining: params.plan.isUnlimited
        ? null
        : (params.plan.sessionsPerMonth ?? 0),
      isUnlimited: params.plan.isUnlimited,
    },
  });
}

export function resolveBillingPeriod(value: string | undefined): string {
  return value?.trim() || DEFAULT_BILLING_PERIOD;
}
