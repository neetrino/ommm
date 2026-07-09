import { BadRequestException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';
import type { UpsertPackagePlanDto } from './dto/upsert-package-plan.dto';
import {
  normalizeCategoryName,
  normalizeCurrency,
  normalizeFeatures,
  normalizeNullableString,
  normalizeOptionalPlanStartDate,
  normalizeSessionsPerMonth,
  normalizeSlug,
  requireNonEmptyString,
  resolveBillingPeriod,
} from './packages-plan.helpers';
import {
  DEFAULT_BILLING_PERIOD,
  DEFAULT_PERIOD_DAYS,
  type ResolvedTypeSessionAllocations,
} from './packages-plan.types';
import { packageStockRequiresDeactivation } from './packages-stock.helpers';

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
      (item) => !Number.isInteger(item.sessionCount) || item.sessionCount <= 0,
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

export function buildCreatePlanData(
  dto: UpsertPackagePlanDto,
  name: string,
  slug: string,
  categoryName: string,
  categorySlug: string,
  resolvedTypeSessions: ResolvedTypeSessionAllocations | undefined,
  displayOrder: number,
) {
  return {
    name,
    slug,
    categoryName,
    categorySlug,
    ...resolveClassTypeConnect(dto, resolvedTypeSessions),
    description: normalizeNullableString(dto.description),
    priceCents: dto.priceCents ?? 0,
    discountedPriceCents: dto.discountedPriceCents ?? null,
    pricePerSessionCents: dto.pricePerSessionCents ?? 0,
    showPricePerSession: dto.showPricePerSession ?? true,
    currency: normalizeCurrency(dto.currency),
    billingPeriod: dto.billingPeriod ?? DEFAULT_BILLING_PERIOD,
    periodDays: dto.periodDays ?? DEFAULT_PERIOD_DAYS,
    startDate: normalizeOptionalPlanStartDate(dto.startDate) ?? null,
    sessionsPerMonth:
      resolvedTypeSessions?.totalSessions ?? normalizeSessionsPerMonth(dto),
    isUnlimited: dto.isUnlimited ?? false,
    guestCount: dto.guestCount ?? 0,
    availableQuantity: dto.availableQuantity ?? null,
    buttonLabel: dto.buttonLabel?.trim() || 'Buy now',
    features: normalizeFeatures(dto.features),
    isPopular: dto.isPopular ?? false,
    isActive: packageStockRequiresDeactivation(dto.availableQuantity)
      ? false
      : (dto.isActive ?? true),
    displayOrder,
    ...(resolvedTypeSessions !== undefined
      ? { typeSessionAllocations: resolvedTypeSessions.allocations }
      : {}),
  };
}

export function buildUpdatePlanData(
  dto: UpsertPackagePlanDto,
  nextSlug: string,
  resolvedTypeSessions: ResolvedTypeSessionAllocations | undefined,
) {
  return {
    ...(dto.name !== undefined
      ? {
          name: requireNonEmptyString(dto.name, 'Plan name is required'),
        }
      : {}),
    ...(dto.slug !== undefined || dto.name !== undefined
      ? { slug: nextSlug }
      : {}),
    ...(dto.categoryName !== undefined
      ? { categoryName: normalizeCategoryName(dto.categoryName) }
      : {}),
    ...(dto.categorySlug !== undefined && dto.categorySlug.trim().length > 0
      ? { categorySlug: normalizeSlug(dto.categorySlug) }
      : {}),
    ...resolveClassTypeUpdate(dto, resolvedTypeSessions),
    ...(dto.description !== undefined
      ? { description: normalizeNullableString(dto.description) }
      : {}),
    ...(dto.priceCents !== undefined ? { priceCents: dto.priceCents } : {}),
    ...(dto.discountedPriceCents !== undefined
      ? { discountedPriceCents: dto.discountedPriceCents }
      : {}),
    ...(dto.pricePerSessionCents !== undefined
      ? { pricePerSessionCents: dto.pricePerSessionCents }
      : {}),
    ...(dto.showPricePerSession !== undefined
      ? { showPricePerSession: dto.showPricePerSession }
      : {}),
    ...(dto.currency !== undefined
      ? { currency: normalizeCurrency(dto.currency) }
      : {}),
    ...(dto.billingPeriod !== undefined
      ? { billingPeriod: resolveBillingPeriod(dto.billingPeriod) }
      : {}),
    ...(dto.periodDays !== undefined ? { periodDays: dto.periodDays } : {}),
    ...(dto.startDate !== undefined
      ? { startDate: normalizeOptionalPlanStartDate(dto.startDate) ?? null }
      : {}),
    ...(dto.sessionsPerMonth !== undefined
      ? { sessionsPerMonth: dto.sessionsPerMonth }
      : resolvedTypeSessions !== undefined
        ? { sessionsPerMonth: resolvedTypeSessions.totalSessions }
        : {}),
    ...(dto.isUnlimited !== undefined ? { isUnlimited: dto.isUnlimited } : {}),
    ...(dto.guestCount !== undefined ? { guestCount: dto.guestCount } : {}),
    ...(dto.availableQuantity !== undefined
      ? { availableQuantity: dto.availableQuantity }
      : {}),
    ...(dto.buttonLabel !== undefined
      ? { buttonLabel: dto.buttonLabel.trim() || 'Buy now' }
      : {}),
    ...(dto.features !== undefined
      ? { features: normalizeFeatures(dto.features) }
      : {}),
    ...(dto.isPopular !== undefined ? { isPopular: dto.isPopular } : {}),
    ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
    ...(packageStockRequiresDeactivation(dto.availableQuantity)
      ? { isActive: false }
      : {}),
    ...(dto.displayOrder !== undefined
      ? { displayOrder: dto.displayOrder }
      : {}),
    ...(resolvedTypeSessions !== undefined
      ? { typeSessionAllocations: resolvedTypeSessions.allocations }
      : {}),
  };
}

function resolveClassTypeConnect(
  dto: UpsertPackagePlanDto,
  resolvedTypeSessions: ResolvedTypeSessionAllocations | undefined,
) {
  if (resolvedTypeSessions !== undefined) {
    if (resolvedTypeSessions.classTypeId === null) {
      return {};
    }
    return {
      classType: { connect: { id: resolvedTypeSessions.classTypeId } },
    };
  }
  if (dto.classTypeId !== undefined && dto.classTypeId !== null) {
    return { classType: { connect: { id: dto.classTypeId } } };
  }
  return {};
}

function resolveClassTypeUpdate(
  dto: UpsertPackagePlanDto,
  resolvedTypeSessions: ResolvedTypeSessionAllocations | undefined,
) {
  if (dto.classTypeId !== undefined) {
    if (dto.classTypeId === null) {
      return { classType: { disconnect: true } };
    }
    return { classType: { connect: { id: dto.classTypeId } } };
  }
  if (resolvedTypeSessions !== undefined) {
    if (resolvedTypeSessions.classTypeId === null) {
      return { classType: { disconnect: true } };
    }
    return {
      classType: { connect: { id: resolvedTypeSessions.classTypeId } },
    };
  }
  return {};
}
