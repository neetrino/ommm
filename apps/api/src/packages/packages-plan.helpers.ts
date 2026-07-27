import { BadRequestException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { PrismaService } from '../prisma/prisma.service';
import type { UpsertPackagePlanDto } from './dto/upsert-package-plan.dto';
import {
  CATEGORY_FALLBACK,
  DEFAULT_BILLING_PERIOD,
  type AdminPlanRecord,
  type PublicPlanSource,
  type StoredTypeSessionAllocation,
} from './packages-plan.types';
import { parsePlanStartDate } from './user-package-period.util';

export function toPublicPlan(
  plan: PublicPlanSource,
  classTypeNameById?: Map<string, string>,
) {
  return {
    id: plan.id,
    name: plan.name,
    categoryName: plan.categoryName,
    categorySlug: plan.categorySlug,
    description: plan.description,
    priceCents: plan.priceCents,
    discountedPriceCents: plan.discountedPriceCents,
    pricePerSessionCents: plan.pricePerSessionCents,
    showPricePerSession: plan.showPricePerSession,
    currency: plan.currency,
    billingPeriod: plan.billingPeriod,
    periodDays: plan.periodDays,
    startDate: formatPlanStartDateForApi(plan.startDate),
    sessionsPerMonth: plan.sessionsPerMonth,
    isUnlimited: plan.isUnlimited,
    isPopular: plan.isPopular,
    isActive: plan.isActive,
    features: plan.features,
    guestCount: plan.guestCount,
    availableQuantity: plan.availableQuantity,
    displayOrder: plan.displayOrder,
    classTypeId: plan.classTypeId ?? null,
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
    startDate: formatPlanStartDateForApi(plan.startDate),
    features: plan.features,
    buttonLabel: plan.buttonLabel,
    isPopular: plan.isPopular,
    isActive: plan.isActive,
    displayOrder: plan.displayOrder,
    sessionsPerMonth: plan.sessionsPerMonth,
    isUnlimited: plan.isUnlimited,
    guestCount: plan.guestCount,
    availableQuantity: plan.availableQuantity,
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

function trimEdgeHyphens(value: string): string {
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

/**
 * Parses optional YYYY-MM-DD plan start date for create/update.
 * Empty string clears the value; undefined leaves the field unchanged.
 */
export function normalizeOptionalPlanStartDate(
  value: string | null | undefined,
): Date | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  const trimmed = value?.trim() ?? '';
  if (trimmed.length === 0) {
    return null;
  }
  try {
    return parsePlanStartDate(trimmed);
  } catch {
    throw new BadRequestException('Invalid package start date');
  }
}

function formatPlanStartDateForApi(
  value: Date | null | undefined,
): string | null {
  if (value == null) {
    return null;
  }
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, '0');
  const day = String(value.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
  return new Map(classTypes.map((classType) => [classType.id, classType.name]));
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

export function resolveBillingPeriod(value: string | undefined): string {
  return value?.trim() || DEFAULT_BILLING_PERIOD;
}
