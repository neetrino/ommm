import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ManualPaymentMethod,
  PaymentSource,
  PaymentStatus,
  type Prisma,
} from '@prisma/client';
import { randomBytes } from 'node:crypto';
import {
  PUBLIC_CACHE_KEYS,
  PUBLIC_CACHE_TTL_SEC,
} from '../cache/public-cache-keys';
import { RedisCacheService } from '../cache/redis-cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { ReconcilePackagesDto } from './dto/reconcile-packages.dto';
import { SubscribePackageDto } from './dto/subscribe-package.dto';
import { UpdateCategoryStatusDto } from './dto/update-category-status.dto';
import { UpsertPackagePlanDto } from './dto/upsert-package-plan.dto';
import { isArcaCheckoutEnabled } from '../payments/payment-arca.util';
import { PackageUsageService } from './package-usage.service';
import {
  buildUserPackagePlanSnapshot,
  resolveUserPackagePlan,
} from './user-package-plan-snapshot.util';

type AdminPlanRecord = {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  categorySlug: string;
  classTypeId?: string | null;
  description: string | null;
  priceCents: number;
  discountedPriceCents: number | null;
  pricePerSessionCents: number;
  showPricePerSession: boolean;
  currency: string;
  billingPeriod: string;
  periodDays: number;
  sessionsPerMonth: number | null;
  isUnlimited: boolean;
  guestCount: number;
  buttonLabel: string;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  displayOrder: number;
  typeSessionAllocations?: unknown;
  createdAt: Date;
  updatedAt: Date;
};

type StoredTypeSessionAllocation = {
  classTypeId: string;
  classTypeName?: string;
  sessionCount: number;
  description?: string | null;
};

type ResolvedTypeSessionAllocations = {
  allocations: StoredTypeSessionAllocation[];
  totalSessions: number;
  classTypeId: string | null;
};

const USER_PACKAGE_STATUS = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  PENDING: 'PENDING',
} as const;

const DEFAULT_BILLING_PERIOD = 'monthly';
const DEFAULT_PERIOD_DAYS = 30;
const CATEGORY_FALLBACK = 'General';

@Injectable()
export class PackagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly packageUsage: PackageUsageService,
    private readonly config: ConfigService,
    private readonly cache: RedisCacheService,
  ) {}

  async listPlans() {
    return this.cache.getOrSet(
      PUBLIC_CACHE_KEYS.packages,
      PUBLIC_CACHE_TTL_SEC.packages,
      () => this.loadPublicPlansFromDb(),
    );
  }

  private async loadPublicPlansFromDb() {
    const plans = await this.prisma.packagePlan.findMany({
      where: {
        isActive: true,
        priceCents: { gt: 0 },
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
    const classTypeNameById =
      await this.resolveClassTypeNameMapForAllocations(plans);
    return plans.map((plan) => this.toPublicPlan(plan, classTypeNameById));
  }

  private async invalidatePublicPlansCache(): Promise<void> {
    await this.cache.invalidate(PUBLIC_CACHE_KEYS.packages);
  }

  async listPlansAdmin() {
    const plans = await this.findPlansForAdmin();
    return plans.map((plan) => this.toAdminPlanRow(plan));
  }

  async listCategoryNamesAdmin() {
    const rows = await this.prisma.packagePlan.findMany({
      select: { categoryName: true },
      distinct: ['categoryName'],
      orderBy: { categoryName: 'asc' },
    });
    return rows
      .map((row) => row.categoryName)
      .filter((name) => name.length > 0);
  }

  async createPlan(dto: UpsertPackagePlanDto) {
    const name = this.requireNonEmptyString(dto.name, 'Plan name is required');
    const categoryName = this.normalizeCategoryName(dto.categoryName);
    const categorySlug =
      dto.categorySlug !== undefined && dto.categorySlug.trim().length > 0
        ? this.normalizeSlug(dto.categorySlug)
        : this.buildUniqueCategorySlug(categoryName);
    const slug =
      dto.slug !== undefined && dto.slug.trim().length > 0
        ? this.normalizeSlug(dto.slug)
        : this.buildUniqueCategorySlug(name);
    await this.assertSlugUnique(slug);
    this.assertDiscountBounds(
      dto.priceCents ?? 0,
      dto.discountedPriceCents ?? null,
    );
    const resolvedTypeSessions =
      dto.typeSessionAllocations !== undefined
        ? await this.resolveTypeSessionAllocations(dto.typeSessionAllocations)
        : undefined;
    const created = await this.prisma.packagePlan.create({
      data: {
        name,
        slug,
        categoryName,
        categorySlug,
        ...(resolvedTypeSessions !== undefined
          ? resolvedTypeSessions.classTypeId === null
            ? {}
            : {
                classType: {
                  connect: { id: resolvedTypeSessions.classTypeId },
                },
              }
          : dto.classTypeId !== undefined && dto.classTypeId !== null
            ? { classType: { connect: { id: dto.classTypeId } } }
            : {}),
        description: this.normalizeNullableString(dto.description),
        priceCents: dto.priceCents ?? 0,
        discountedPriceCents: dto.discountedPriceCents ?? null,
        pricePerSessionCents: dto.pricePerSessionCents ?? 0,
        showPricePerSession: dto.showPricePerSession ?? true,
        currency: this.normalizeCurrency(dto.currency),
        billingPeriod: dto.billingPeriod ?? DEFAULT_BILLING_PERIOD,
        periodDays: dto.periodDays ?? DEFAULT_PERIOD_DAYS,
        sessionsPerMonth:
          resolvedTypeSessions?.totalSessions ??
          this.normalizeSessionsPerMonth(dto),
        isUnlimited: dto.isUnlimited ?? false,
        guestCount: dto.guestCount ?? 0,
        buttonLabel: dto.buttonLabel?.trim() || 'Buy now',
        features: this.normalizeFeatures(dto.features),
        isPopular: dto.isPopular ?? false,
        isActive: dto.isActive ?? true,
        displayOrder:
          dto.displayOrder ?? (await this.resolveNextDisplayOrder()),
        ...(resolvedTypeSessions !== undefined
          ? { typeSessionAllocations: resolvedTypeSessions.allocations }
          : {}),
      },
    });
    await this.invalidatePublicPlansCache();
    return this.toAdminPlanRow(created);
  }

  async updatePlan(id: string, dto: UpsertPackagePlanDto) {
    const current = await this.prisma.packagePlan.findUnique({
      where: { id },
    });
    if (current === null) {
      throw new NotFoundException('Plan not found');
    }
    const nextSlug =
      dto.slug !== undefined
        ? this.normalizeSlug(dto.slug)
        : dto.name !== undefined
          ? this.normalizeSlug(dto.name)
          : current.slug;
    if (nextSlug !== current.slug) {
      await this.assertSlugUnique(nextSlug, id);
    }
    const nextPrice = dto.priceCents ?? current.priceCents;
    const nextDiscount =
      dto.discountedPriceCents === undefined
        ? current.discountedPriceCents
        : dto.discountedPriceCents;
    this.assertDiscountBounds(nextPrice, nextDiscount ?? null);

    const resolvedTypeSessions =
      dto.typeSessionAllocations !== undefined
        ? await this.resolveTypeSessionAllocations(dto.typeSessionAllocations)
        : undefined;

    const updated = await this.prisma.$transaction(async (tx) => {
      return tx.packagePlan.update({
        where: { id },
        data: {
          ...(dto.name !== undefined
            ? {
                name: this.requireNonEmptyString(
                  dto.name,
                  'Plan name is required',
                ),
              }
            : {}),
          ...(dto.slug !== undefined || dto.name !== undefined
            ? { slug: nextSlug }
            : {}),
          ...(dto.categoryName !== undefined
            ? { categoryName: this.normalizeCategoryName(dto.categoryName) }
            : {}),
          ...(dto.categorySlug !== undefined &&
          dto.categorySlug.trim().length > 0
            ? { categorySlug: this.normalizeSlug(dto.categorySlug) }
            : {}),
          ...(dto.classTypeId !== undefined
            ? dto.classTypeId === null
              ? { classType: { disconnect: true } }
              : { classType: { connect: { id: dto.classTypeId } } }
            : resolvedTypeSessions !== undefined
              ? resolvedTypeSessions.classTypeId === null
                ? { classType: { disconnect: true } }
                : {
                    classType: {
                      connect: { id: resolvedTypeSessions.classTypeId },
                    },
                  }
              : {}),
          ...(dto.description !== undefined
            ? { description: this.normalizeNullableString(dto.description) }
            : {}),
          ...(dto.priceCents !== undefined
            ? { priceCents: dto.priceCents }
            : {}),
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
            ? { currency: this.normalizeCurrency(dto.currency) }
            : {}),
          ...(dto.billingPeriod !== undefined
            ? {
                billingPeriod:
                  dto.billingPeriod.trim() || DEFAULT_BILLING_PERIOD,
              }
            : {}),
          ...(dto.periodDays !== undefined
            ? { periodDays: dto.periodDays }
            : {}),
          ...(dto.sessionsPerMonth !== undefined
            ? { sessionsPerMonth: dto.sessionsPerMonth }
            : resolvedTypeSessions !== undefined
              ? { sessionsPerMonth: resolvedTypeSessions.totalSessions }
              : {}),
          ...(dto.isUnlimited !== undefined
            ? { isUnlimited: dto.isUnlimited }
            : {}),
          ...(dto.guestCount !== undefined
            ? { guestCount: dto.guestCount }
            : {}),
          ...(dto.buttonLabel !== undefined
            ? { buttonLabel: dto.buttonLabel.trim() || 'Buy now' }
            : {}),
          ...(dto.features !== undefined
            ? { features: this.normalizeFeatures(dto.features) }
            : {}),
          ...(dto.isPopular !== undefined ? { isPopular: dto.isPopular } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
          ...(dto.displayOrder !== undefined
            ? { displayOrder: dto.displayOrder }
            : {}),
          ...(resolvedTypeSessions !== undefined
            ? { typeSessionAllocations: resolvedTypeSessions.allocations }
            : {}),
        },
      });
    });
    await this.invalidatePublicPlansCache();
    return this.toAdminPlanRow(updated);
  }

  async deletePlan(id: string) {
    const plan = await this.prisma.packagePlan.findUnique({
      where: { id },
      select: { id: true },
    });
    if (plan === null) {
      throw new NotFoundException('Plan not found');
    }
    await this.prisma.packagePlan.delete({ where: { id } });
    await this.invalidatePublicPlansCache();
    return { ok: true };
  }

  async updateCategoryStatus(dto: UpdateCategoryStatusDto) {
    const categorySlug = this.normalizeSlug(dto.categorySlug);
    await this.prisma.packagePlan.updateMany({
      where: { categorySlug },
      data: { isActive: dto.isActive },
    });
    const plans = await this.prisma.packagePlan.findMany({
      where: { categorySlug },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
    await this.invalidatePublicPlansCache();
    return {
      categorySlug,
      isActive: dto.isActive,
      plans: plans.map((plan) => this.toAdminPlanRow(plan)),
    };
  }

  async deleteCategory(dto: DeleteCategoryDto) {
    const categorySlug = this.normalizeSlug(dto.categorySlug);
    const rows = await this.prisma.packagePlan.findMany({
      where: { categorySlug },
      select: { id: true },
    });
    if (rows.length === 0) {
      return { deletedIds: [] as string[] };
    }
    const ids = rows.map((row) => row.id);
    await this.prisma.packagePlan.deleteMany({ where: { id: { in: ids } } });
    await this.invalidatePublicPlansCache();
    return { deletedIds: ids };
  }

  async getDeletionBlockers(planId: string) {
    const plan = await this.prisma.packagePlan.findUnique({
      where: { id: planId },
      select: { id: true },
    });
    if (plan === null) {
      throw new NotFoundException('Plan not found');
    }
    const memberships = await this.prisma.userPackage.findMany({
      where: {
        planId,
        status: {
          in: [
            USER_PACKAGE_STATUS.ACTIVE,
            USER_PACKAGE_STATUS.PAUSED,
            USER_PACKAGE_STATUS.PENDING,
          ],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { currentPeriodEnd: 'asc' },
      take: 1000,
    });
    return {
      count: memberships.length,
      allowsDeletion: true,
      memberships,
    };
  }

  async syncExpired(dto: ReconcilePackagesDto) {
    await this.packageUsage.syncExpiredMemberships(dto.userId);
    return { ok: true };
  }

  async reconcileSessions(dto: ReconcilePackagesDto) {
    await this.packageUsage.reconcileSessionsRemaining(dto.userId);
    return { ok: true };
  }

  async listMine(userId: string) {
    const rows = await this.prisma.userPackage.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return rows.map((row) => {
      const resolvedPlan = resolveUserPackagePlan({
        plan: row.plan,
        snapshots: row,
      });
      return {
        id: row.id,
        status: row.status,
        sessionsRemaining: row.sessionsRemaining,
        totalSessions: row.sessionsTotal,
        usedSessions:
          row.sessionsTotal === null || row.sessionsRemaining === null
            ? null
            : Math.max(row.sessionsTotal - row.sessionsRemaining, 0),
        remainingSessions: row.sessionsRemaining,
        isUnlimited: resolvedPlan.isUnlimited,
        currentPeriodStart: row.currentPeriodStart.toISOString(),
        currentPeriodEnd: row.currentPeriodEnd.toISOString(),
        plan: resolvedPlan,
      };
    });
  }

  async subscribe(userId: string, dto: SubscribePackageDto) {
    const plan = await this.prisma.packagePlan.findUnique({
      where: { id: dto.planId },
    });
    if (plan === null || !plan.isActive || plan.priceCents <= 0) {
      throw new NotFoundException('Package plan not found');
    }
    const now = new Date();
    const periodEnd = new Date(now.getTime() + plan.periodDays * 86_400_000);
    const paymentReference = this.createPaymentReference('PACKAGE');

    const created = await this.prisma.$transaction(async (tx) => {
      const userPackage = await tx.userPackage.create({
        data: {
          userId,
          planId: plan.id,
          ...buildUserPackagePlanSnapshot(plan),
          status:
            dto.paymentMethod === ManualPaymentMethod.CARD
              ? USER_PACKAGE_STATUS.PENDING
              : USER_PACKAGE_STATUS.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          sessionsTotal: plan.isUnlimited ? null : (plan.sessionsPerMonth ?? 0),
          sessionsRemaining: plan.isUnlimited
            ? null
            : (plan.sessionsPerMonth ?? 0),
        },
      });
      await this.createBalancesForUserPackage(tx, {
        plan,
        userPackageId: userPackage.id,
      });
      const payment = await tx.payment.create({
        data: {
          userId,
          amountCents: this.resolveFinalPriceCents(plan),
          currency: plan.currency.toLowerCase(),
          status:
            dto.paymentMethod === ManualPaymentMethod.CARD
              ? PaymentStatus.PENDING
              : PaymentStatus.SUCCEEDED,
          paymentReference,
          source: PaymentSource.PACKAGE,
          sourceId: userPackage.id,
          description: `Package ${plan.id}`,
          confirmedAt:
            dto.paymentMethod === ManualPaymentMethod.CARD ? null : new Date(),
          paymentMethod: dto.paymentMethod,
        },
      });
      return {
        userPackageId: userPackage.id,
        paymentReference: payment.paymentReference,
      };
    });

    return {
      id: created.userPackageId,
      paymentReference: created.paymentReference,
      requiresArcaCheckout:
        dto.paymentMethod === ManualPaymentMethod.CARD &&
        isArcaCheckoutEnabled(this.config),
    };
  }

  private async findPlansForAdmin() {
    return this.prisma.packagePlan.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  private toPublicPlan(
    plan: {
      id: string;
      name: string;
      categoryName: string;
      categorySlug: string;
      description: string | null;
      priceCents: number;
      discountedPriceCents: number | null;
      pricePerSessionCents: number;
      showPricePerSession: boolean;
      currency: string;
      billingPeriod: string;
      periodDays: number;
      sessionsPerMonth: number | null;
      isUnlimited: boolean;
      isPopular: boolean;
      isActive: boolean;
      features: string[];
      guestCount: number;
      displayOrder: number;
      typeSessionAllocations?: unknown;
    },
    classTypeNameById?: Map<string, string>,
  ) {
    return {
      ...plan,
      typeSessionAllocations: this.enrichStoredTypeSessionAllocations(
        plan.typeSessionAllocations,
        classTypeNameById,
      ),
      finalPriceCents: this.resolveFinalPriceCents(plan),
    };
  }

  private toAdminPlanRow(plan: AdminPlanRecord) {
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
      typeSessionAllocations: this.parseStoredTypeSessionAllocations(
        plan.typeSessionAllocations,
      ),
      createdAt: plan.createdAt.toISOString(),
    };
  }

  private normalizeCategoryName(value: string | undefined): string {
    const next = value?.trim() ?? '';
    return next.length > 0 ? next : CATEGORY_FALLBACK;
  }

  private normalizeSlug(value: string): string {
    const normalized = this.trimEdgeHyphens(
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
  private buildUniqueCategorySlug(baseName: string): string {
    const normalized = this.trimEdgeHyphens(
      baseName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-'),
    ).slice(0, 100);
    const prefix = normalized.length > 0 ? normalized : 'group';
    return `${prefix}-${randomBytes(4).toString('hex')}`.slice(0, 120);
  }

  private trimEdgeHyphens(value: string): string {
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

  private normalizeCurrency(value?: string): string {
    const next = value?.trim().toUpperCase();
    return next && next.length > 0 ? next : 'AMD';
  }

  private normalizeNullableString(
    value: string | null | undefined,
  ): string | null {
    const trimmed = value?.trim() ?? '';
    return trimmed.length > 0 ? trimmed : null;
  }

  private normalizeFeatures(value: string[] | undefined): string[] {
    if (value === undefined) {
      return [];
    }
    return value
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
      .slice(0, 20);
  }

  private requireNonEmptyString(
    value: string | undefined,
    message: string,
  ): string {
    const next = value?.trim() ?? '';
    if (next.length === 0) {
      throw new BadRequestException(message);
    }
    return next;
  }

  private async assertSlugUnique(slug: string, excludeId?: string) {
    const conflict = await this.prisma.packagePlan.findFirst({
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

  private async resolveNextDisplayOrder(tx?: Prisma.TransactionClient) {
    const client = tx ?? this.prisma;
    const maxRow = await client.packagePlan.findFirst({
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    });
    return (maxRow?.displayOrder ?? 0) + 1;
  }

  private assertDiscountBounds(
    priceCents: number,
    discountedPriceCents: number | null,
  ) {
    if (discountedPriceCents === null) {
      return;
    }
    if (discountedPriceCents < 0 || discountedPriceCents >= priceCents) {
      throw new BadRequestException(
        'Discounted price must be non-negative and lower than full price',
      );
    }
  }

  private resolveFinalPriceCents(plan: {
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

  private normalizeSessionsPerMonth(dto: UpsertPackagePlanDto): number | null {
    if (dto.isUnlimited === true) {
      return null;
    }
    if (dto.sessionsPerMonth === undefined) {
      return 0;
    }
    return dto.sessionsPerMonth;
  }

  private async assertPlanDeletable(planId: string) {
    const blockers = await this.getDeletionBlockers(planId);
    if (blockers.count > 0) {
      throw new BadRequestException(
        'Cannot delete package plan with active member packages',
      );
    }
  }

  private async createBalancesForUserPackage(
    tx: Prisma.TransactionClient,
    params: { plan: AdminPlanRecord; userPackageId: string },
  ) {
    const typeAllocations = this.parseStoredTypeSessionAllocations(
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

  private createPaymentReference(prefix: string): string {
    return `${prefix}-${randomBytes(6).toString('hex').toUpperCase()}`;
  }

  private async resolveClassTypeNameMapForAllocations(
    plans: readonly { typeSessionAllocations?: unknown }[],
  ): Promise<Map<string, string>> {
    const classTypeIds = new Set<string>();
    for (const plan of plans) {
      for (const allocation of this.parseStoredTypeSessionAllocations(
        plan.typeSessionAllocations,
      )) {
        classTypeIds.add(allocation.classTypeId);
      }
    }
    if (classTypeIds.size === 0) {
      return new Map();
    }
    const classTypes = await this.prisma.classType.findMany({
      where: { id: { in: [...classTypeIds] } },
      select: { id: true, name: true },
    });
    return new Map(
      classTypes.map((classType) => [classType.id, classType.name]),
    );
  }

  private enrichStoredTypeSessionAllocations(
    value: unknown,
    classTypeNameById?: Map<string, string>,
  ): StoredTypeSessionAllocation[] {
    return this.parseStoredTypeSessionAllocations(value).map((allocation) => {
      const classTypeName = classTypeNameById?.get(allocation.classTypeId);
      return {
        ...allocation,
        ...(classTypeName !== undefined && classTypeName.trim().length > 0
          ? { classTypeName: classTypeName.trim() }
          : {}),
      };
    });
  }

  private parseStoredTypeSessionAllocations(
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

  private async resolveTypeSessionAllocations(
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
    const existingClassTypes = await this.prisma.classType.findMany({
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
}
