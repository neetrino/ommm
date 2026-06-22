import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ManualPaymentMethod,
  PackagePlanType,
  PaymentSource,
  PaymentStatus,
  type Prisma,
} from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCombinedPackagePlanDto } from './dto/create-combined-package-plan.dto';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { ReconcilePackagesDto } from './dto/reconcile-packages.dto';
import { SubscribePackageDto } from './dto/subscribe-package.dto';
import { UpdateCategoryStatusDto } from './dto/update-category-status.dto';
import { UpsertPackagePlanDto } from './dto/upsert-package-plan.dto';
import { PackageUsageService } from './package-usage.service';

type AdminCombinedPlanComponentRow = {
  id: string;
  sourcePlanId: string;
  sourcePackageNameSnapshot: string;
  sourceCategoryNameSnapshot: string;
  sessionAllocation: number | null;
  sourcePlan?: {
    id: string;
    name: string;
    categoryName: string;
  };
};

type AdminPlanWithComponents = {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  classTypeId?: string | null;
  planType: PackagePlanType;
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
  combinedAsParent?: AdminCombinedPlanComponentRow[];
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
  ) {}

  async listPlans() {
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
    const slug = this.normalizeSlug(dto.slug ?? name);
    const categoryName = this.normalizeCategoryName(dto.categoryName);
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
        planType: dto.planType ?? PackagePlanType.SINGLE,
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
    return this.toAdminPlanRow(await this.withCombinedComponents(created));
  }

  async createCombinedPlan(dto: CreateCombinedPackagePlanDto) {
    const sourcePlanIds = Array.from(
      new Set(
        dto.sourcePlanIds
          .map((planId) => planId.trim())
          .filter((planId) => planId.length > 0),
      ),
    );
    if (sourcePlanIds.length < 2) {
      throw new BadRequestException(
        'Combined plan requires at least two source plans',
      );
    }
    const sourcePlans = await this.prisma.packagePlan.findMany({
      where: {
        id: { in: sourcePlanIds },
        planType: PackagePlanType.SINGLE,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        categoryName: true,
      },
    });
    if (sourcePlans.length !== sourcePlanIds.length) {
      throw new BadRequestException(
        'Combined source plans must be active single plans',
      );
    }
    const sourcePlanById = new Map(sourcePlans.map((plan) => [plan.id, plan]));
    const orderedSourcePlans = sourcePlanIds.map((planId) =>
      sourcePlanById.get(planId),
    );
    if (orderedSourcePlans.some((plan) => plan === undefined)) {
      throw new BadRequestException(
        'Combined source plans must be active single plans',
      );
    }
    const resolvedSourcePlans = orderedSourcePlans.filter(
      (plan): plan is { id: string; name: string; categoryName: string } =>
        plan !== undefined,
    );
    const sourceCategoryKeys = new Set(
      resolvedSourcePlans.map((plan) =>
        this.normalizeCategoryKey(plan.categoryName),
      ),
    );
    if (sourceCategoryKeys.size !== resolvedSourcePlans.length) {
      throw new BadRequestException(
        'Combined source plans must come from distinct categories',
      );
    }
    if (dto.isUnlimited === true) {
      throw new BadRequestException('Combined plans cannot be unlimited');
    }
    const categoryName = this.buildCombinedCategoryName(resolvedSourcePlans);
    const name = this.requireNonEmptyString(dto.name, 'Plan name is required');
    const slug = this.normalizeSlug(name);
    await this.assertSlugUnique(slug);

    const created = await this.prisma.$transaction(async (tx) => {
      const plan = await tx.packagePlan.create({
        data: {
          name,
          slug,
          categoryName,
          planType: PackagePlanType.COMBINED,
          description: this.normalizeNullableString(dto.description),
          priceCents: dto.priceCents ?? 0,
          pricePerSessionCents: dto.pricePerSessionCents ?? 0,
          showPricePerSession: dto.showPricePerSession ?? true,
          currency: this.normalizeCurrency(dto.currency),
          billingPeriod: dto.billingPeriod ?? DEFAULT_BILLING_PERIOD,
          periodDays: dto.periodDays ?? DEFAULT_PERIOD_DAYS,
          sessionsPerMonth: dto.sessionsPerMonth ?? 0,
          isUnlimited: dto.isUnlimited ?? false,
          guestCount: dto.guestCount ?? 0,
          isPopular: dto.isPopular ?? false,
          isActive: dto.isActive ?? true,
          displayOrder: await this.resolveNextDisplayOrder(tx),
        },
      });
      for (const source of resolvedSourcePlans) {
        await (
          tx as unknown as {
            combinedPlanComponent: {
              create(args: unknown): Promise<unknown>;
            };
          }
        ).combinedPlanComponent.create({
          data: {
            combinedPlanId: plan.id,
            sourcePlanId: source.id,
            sourcePackageNameSnapshot: source.name,
            sourceCategoryNameSnapshot: source.categoryName,
            sessionAllocation: 0,
          },
        });
      }
      return tx.packagePlan.findUniqueOrThrow({ where: { id: plan.id } });
    });
    return this.toAdminPlanRow(await this.withCombinedComponents(created));
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
    if (dto.planType !== undefined && dto.planType !== current.planType) {
      throw new BadRequestException('Plan type cannot be changed');
    }
    if (
      current.planType === PackagePlanType.COMBINED &&
      dto.sourceSessionAllocations === undefined &&
      dto.sessionsPerMonth !== undefined
    ) {
      throw new BadRequestException(
        'Combined sessions must be updated via source allocations',
      );
    }
    if (
      current.planType === PackagePlanType.COMBINED &&
      dto.isUnlimited === true
    ) {
      throw new BadRequestException('Combined plans cannot be unlimited');
    }
    if (
      current.planType === PackagePlanType.COMBINED &&
      dto.typeSessionAllocations !== undefined
    ) {
      throw new BadRequestException(
        'Type session allocations apply only to single plans',
      );
    }

    const resolvedTypeSessions =
      dto.typeSessionAllocations !== undefined
        ? await this.resolveTypeSessionAllocations(dto.typeSessionAllocations)
        : undefined;

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.sourceSessionAllocations !== undefined) {
        await this.applySourceAllocations(tx, id, dto.sourceSessionAllocations);
      }
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
          ...(dto.planType !== undefined ? { planType: dto.planType } : {}),
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
    return this.toAdminPlanRow(await this.withCombinedComponents(updated));
  }

  async deletePlan(id: string) {
    await this.assertPlanDeletable(id);
    await this.prisma.$transaction(async (tx) => {
      await (
        tx as unknown as {
          combinedPlanComponent: {
            deleteMany(args: unknown): Promise<unknown>;
          };
        }
      ).combinedPlanComponent.deleteMany({
        where: {
          OR: [{ combinedPlanId: id }, { sourcePlanId: id }],
        },
      });
      await tx.packagePlan.delete({ where: { id } });
    });
    return { ok: true };
  }

  async updateCategoryStatus(dto: UpdateCategoryStatusDto) {
    const categoryName = this.normalizeCategoryName(dto.categoryName);
    await this.prisma.packagePlan.updateMany({
      where: { categoryName },
      data: { isActive: dto.isActive },
    });
    const plans = await this.prisma.packagePlan.findMany({
      where: { categoryName },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
    const withComponents = await Promise.all(
      plans.map((plan) => this.withCombinedComponents(plan)),
    );
    return {
      categoryName,
      isActive: dto.isActive,
      plans: withComponents.map((plan) => this.toAdminPlanRow(plan)),
    };
  }

  async deleteCategory(dto: DeleteCategoryDto) {
    const categoryName = this.normalizeCategoryName(dto.categoryName);
    const rows = await this.prisma.packagePlan.findMany({
      where: { categoryName },
      select: { id: true },
    });
    if (rows.length === 0) {
      return { deletedIds: [] as string[] };
    }
    for (const row of rows) {
      await this.assertPlanDeletable(row.id);
    }
    const ids = rows.map((row) => row.id);
    await this.prisma.$transaction(async (tx) => {
      await (
        tx as unknown as {
          combinedPlanComponent: {
            deleteMany(args: unknown): Promise<unknown>;
          };
        }
      ).combinedPlanComponent.deleteMany({
        where: {
          OR: [{ combinedPlanId: { in: ids } }, { sourcePlanId: { in: ids } }],
        },
      });
      await tx.packagePlan.deleteMany({ where: { id: { in: ids } } });
    });
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
    return { count: memberships.length, memberships };
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
    return rows.map((row) => ({
      id: row.id,
      status: row.status,
      sessionsRemaining: row.sessionsRemaining,
      totalSessions: row.sessionsTotal,
      usedSessions:
        row.sessionsTotal === null || row.sessionsRemaining === null
          ? null
          : Math.max(row.sessionsTotal - row.sessionsRemaining, 0),
      remainingSessions: row.sessionsRemaining,
      isUnlimited: row.plan.isUnlimited,
      currentPeriodStart: row.currentPeriodStart.toISOString(),
      currentPeriodEnd: row.currentPeriodEnd.toISOString(),
      plan: {
        id: row.plan.id,
        name: row.plan.name,
        categoryName: row.plan.categoryName,
        priceCents: row.plan.priceCents,
        periodDays: row.plan.periodDays,
        isUnlimited: row.plan.isUnlimited,
        sessionsPerMonth: row.plan.sessionsPerMonth,
      },
    }));
  }

  async subscribe(userId: string, dto: SubscribePackageDto) {
    const plan = await this.prisma.packagePlan.findUnique({
      where: { id: dto.planId },
    });
    if (plan === null || !plan.isActive || plan.priceCents <= 0) {
      throw new NotFoundException('Package plan not found');
    }
    const planWithComponents = await this.withCombinedComponents(plan);
    const now = new Date();
    const periodEnd = new Date(now.getTime() + plan.periodDays * 86_400_000);
    const paymentReference = this.createPaymentReference('PACKAGE');

    const created = await this.prisma.$transaction(async (tx) => {
      const userPackage = await tx.userPackage.create({
        data: {
          userId,
          planId: plan.id,
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
        plan: planWithComponents,
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
      requiresArcaCheckout: dto.paymentMethod === ManualPaymentMethod.CARD,
    };
  }

  private async findPlansForAdmin() {
    const plans = await this.prisma.packagePlan.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
    return Promise.all(plans.map((plan) => this.withCombinedComponents(plan)));
  }

  private toPublicPlan(
    plan: {
      id: string;
      name: string;
      categoryName: string;
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

  private toAdminPlanRow(plan: AdminPlanWithComponents) {
    const combinedComponents = (plan.combinedAsParent ?? []).map(
      (component) => ({
        id: component.id,
        sourcePackagePlanId: component.sourcePlan?.id ?? component.sourcePlanId,
        sourcePackageNameSnapshot: component.sourcePackageNameSnapshot,
        sourceCategoryNameSnapshot: component.sourceCategoryNameSnapshot,
        sessionAllocation: component.sessionAllocation,
      }),
    );
    return {
      id: plan.id,
      name: plan.name,
      categoryName: plan.categoryName,
      classTypeId: plan.classTypeId ?? null,
      planType: plan.planType,
      allowedCategoryNames:
        plan.planType === PackagePlanType.COMBINED
          ? Array.from(
              new Set(
                combinedComponents.map(
                  (component) => component.sourceCategoryNameSnapshot,
                ),
              ),
            )
          : [plan.categoryName],
      combinedComponents,
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

  private async withCombinedComponents<T extends { id: string }>(
    plan: T,
  ): Promise<T & { combinedAsParent: AdminCombinedPlanComponentRow[] }> {
    const components = await (
      this.prisma as unknown as {
        combinedPlanComponent: {
          findMany(args: unknown): Promise<AdminCombinedPlanComponentRow[]>;
        };
      }
    ).combinedPlanComponent.findMany({
      where: { combinedPlanId: plan.id },
      include: {
        sourcePlan: {
          select: { id: true, name: true, categoryName: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return { ...plan, combinedAsParent: components };
  }

  private normalizeCategoryName(value: string | undefined): string {
    const next = value?.trim() ?? '';
    return next.length > 0 ? next : CATEGORY_FALLBACK;
  }

  private normalizeCategoryKey(value: string): string {
    return value.trim().toLowerCase();
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

  private buildCombinedCategoryName(
    plans: Array<{ categoryName: string; name: string }>,
  ): string {
    const categories = Array.from(
      new Set(
        plans
          .map((plan) => plan.categoryName.trim())
          .filter((categoryName) => categoryName.length > 0),
      ),
    );
    if (categories.length > 0) {
      return categories.join(' + ').slice(0, 120);
    }
    return plans
      .map((plan) => plan.name.trim())
      .filter(Boolean)
      .join(' + ')
      .slice(0, 120);
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

  private async applySourceAllocations(
    tx: Prisma.TransactionClient,
    planId: string,
    allocations: Array<{ componentId: string; sessionCount: number }>,
  ) {
    const plan = await tx.packagePlan.findUnique({
      where: { id: planId },
      select: { id: true, planType: true },
    });
    if (plan === null) {
      throw new NotFoundException('Plan not found');
    }
    if (plan.planType !== PackagePlanType.COMBINED) {
      throw new BadRequestException(
        'Source allocations are allowed only for combined plans',
      );
    }
    const componentIds = allocations.map((item) => item.componentId);
    const uniqueComponentIds = new Set(componentIds);
    if (uniqueComponentIds.size !== componentIds.length) {
      throw new BadRequestException(
        'Source allocation component ids must be unique',
      );
    }
    const components = await (
      tx as unknown as {
        combinedPlanComponent: {
          findMany(args: unknown): Promise<Array<{ id: string }>>;
          update(args: unknown): Promise<unknown>;
        };
      }
    ).combinedPlanComponent.findMany({
      where: { combinedPlanId: planId },
      select: { id: true },
    });
    if (components.length === 0) {
      throw new BadRequestException('Combined plan has no source components');
    }
    if (components.length !== allocations.length) {
      throw new BadRequestException(
        'Source allocations must include every combined component',
      );
    }
    for (const component of components) {
      if (!uniqueComponentIds.has(component.id)) {
        throw new BadRequestException(
          'Source allocations must include every combined component',
        );
      }
    }
    if (allocations.some((allocation) => allocation.sessionCount <= 0)) {
      throw new BadRequestException(
        'Source allocation session count must be positive',
      );
    }
    let sum = 0;
    for (const allocation of allocations) {
      sum += allocation.sessionCount;
      await (
        tx as unknown as {
          combinedPlanComponent: {
            update(args: unknown): Promise<unknown>;
          };
        }
      ).combinedPlanComponent.update({
        where: { id: allocation.componentId },
        data: { sessionAllocation: allocation.sessionCount },
      });
    }
    await tx.packagePlan.update({
      where: { id: planId },
      data: { sessionsPerMonth: sum, isUnlimited: false },
    });
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
    params: { plan: AdminPlanWithComponents; userPackageId: string },
  ) {
    if (params.plan.planType === PackagePlanType.COMBINED) {
      for (const component of params.plan.combinedAsParent ?? []) {
        const total = component.sessionAllocation;
        await (
          tx as unknown as {
            userPackageBalance: {
              create(args: unknown): Promise<unknown>;
            };
          }
        ).userPackageBalance.create({
          data: {
            userPackageId: params.userPackageId,
            sourcePlanId: component.sourcePlan?.id ?? component.sourcePlanId,
            coverageKey: `${params.userPackageId}:${component.id}`,
            sourcePackageNameSnapshot: component.sourcePackageNameSnapshot,
            sourceCategoryNameSnapshot: component.sourceCategoryNameSnapshot,
            sessionsTotal: total,
            sessionsRemaining: total,
            isUnlimited: total === null,
          },
        });
      }
      return;
    }
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
