import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { ReconcilePackagesDto } from './dto/reconcile-packages.dto';
import { UpdateCategoryStatusDto } from './dto/update-category-status.dto';
import { UpsertPackagePlanDto } from './dto/upsert-package-plan.dto';
import { PackageUsageService } from './package-usage.service';
import {
  assertDiscountBounds,
  assertSlugUnique,
  buildUniqueCategorySlug,
  normalizeCategoryName,
  normalizeCurrency,
  normalizeFeatures,
  normalizeNullableString,
  normalizeSessionsPerMonth,
  normalizeSlug,
  requireNonEmptyString,
  resolveBillingPeriod,
  resolveNextDisplayOrder,
  resolveTypeSessionAllocations,
  toAdminPlanRow,
} from './packages-plan.helpers';
import {
  DEFAULT_BILLING_PERIOD,
  DEFAULT_PERIOD_DAYS,
  USER_PACKAGE_STATUS,
} from './packages-plan.types';
import { PackagesPublicService } from './packages-public.service';

@Injectable()
export class PackagesAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly publicService: PackagesPublicService,
    private readonly packageUsage: PackageUsageService,
  ) {}

  async listPlansAdmin() {
    const plans = await this.findPlansForAdmin();
    return plans.map((plan) => toAdminPlanRow(plan));
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
    const name = requireNonEmptyString(dto.name, 'Plan name is required');
    const categoryName = normalizeCategoryName(dto.categoryName);
    const categorySlug =
      dto.categorySlug !== undefined && dto.categorySlug.trim().length > 0
        ? normalizeSlug(dto.categorySlug)
        : buildUniqueCategorySlug(categoryName);
    const slug =
      dto.slug !== undefined && dto.slug.trim().length > 0
        ? normalizeSlug(dto.slug)
        : buildUniqueCategorySlug(name);
    await assertSlugUnique(this.prisma, slug);
    assertDiscountBounds(
      dto.priceCents ?? 0,
      dto.discountedPriceCents ?? null,
    );
    const resolvedTypeSessions =
      dto.typeSessionAllocations !== undefined
        ? await resolveTypeSessionAllocations(
            this.prisma,
            dto.typeSessionAllocations,
          )
        : undefined;
    const displayOrder =
      dto.displayOrder ?? (await resolveNextDisplayOrder(this.prisma));
    const created = await this.prisma.packagePlan.create({
      data: this.buildCreatePlanData(
        dto,
        name,
        slug,
        categoryName,
        categorySlug,
        resolvedTypeSessions,
        displayOrder,
      ),
    });
    await this.publicService.invalidatePublicPlansCache();
    return toAdminPlanRow(created);
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
        ? normalizeSlug(dto.slug)
        : dto.name !== undefined
          ? normalizeSlug(dto.name)
          : current.slug;
    if (nextSlug !== current.slug) {
      await assertSlugUnique(this.prisma, nextSlug, id);
    }
    const nextPrice = dto.priceCents ?? current.priceCents;
    const nextDiscount =
      dto.discountedPriceCents === undefined
        ? current.discountedPriceCents
        : dto.discountedPriceCents;
    assertDiscountBounds(nextPrice, nextDiscount ?? null);

    const resolvedTypeSessions =
      dto.typeSessionAllocations !== undefined
        ? await resolveTypeSessionAllocations(
            this.prisma,
            dto.typeSessionAllocations,
          )
        : undefined;

    const updated = await this.prisma.$transaction(async (tx) => {
      return tx.packagePlan.update({
        where: { id },
        data: this.buildUpdatePlanData(
          dto,
          current,
          nextSlug,
          resolvedTypeSessions,
        ),
      });
    });
    await this.publicService.invalidatePublicPlansCache();
    return toAdminPlanRow(updated);
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
    await this.publicService.invalidatePublicPlansCache();
    return { ok: true };
  }

  async updateCategoryStatus(dto: UpdateCategoryStatusDto) {
    const categorySlug = normalizeSlug(dto.categorySlug);
    await this.prisma.packagePlan.updateMany({
      where: { categorySlug },
      data: { isActive: dto.isActive },
    });
    const plans = await this.prisma.packagePlan.findMany({
      where: { categorySlug },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
    await this.publicService.invalidatePublicPlansCache();
    return {
      categorySlug,
      isActive: dto.isActive,
      plans: plans.map((plan) => toAdminPlanRow(plan)),
    };
  }

  async deleteCategory(dto: DeleteCategoryDto) {
    const categorySlug = normalizeSlug(dto.categorySlug);
    const rows = await this.prisma.packagePlan.findMany({
      where: { categorySlug },
      select: { id: true },
    });
    if (rows.length === 0) {
      return { deletedIds: [] as string[] };
    }
    const ids = rows.map((row) => row.id);
    await this.prisma.packagePlan.deleteMany({ where: { id: { in: ids } } });
    await this.publicService.invalidatePublicPlansCache();
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

  private async findPlansForAdmin() {
    return this.prisma.packagePlan.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  private buildCreatePlanData(
    dto: UpsertPackagePlanDto,
    name: string,
    slug: string,
    categoryName: string,
    categorySlug: string,
    resolvedTypeSessions: Awaited<
      ReturnType<typeof resolveTypeSessionAllocations>
    > | undefined,
    displayOrder: number,
  ) {
    return {
      name,
      slug,
      categoryName,
      categorySlug,
      ...this.resolveClassTypeConnect(dto, resolvedTypeSessions),
      description: normalizeNullableString(dto.description),
      priceCents: dto.priceCents ?? 0,
      discountedPriceCents: dto.discountedPriceCents ?? null,
      pricePerSessionCents: dto.pricePerSessionCents ?? 0,
      showPricePerSession: dto.showPricePerSession ?? true,
      currency: normalizeCurrency(dto.currency),
      billingPeriod: dto.billingPeriod ?? DEFAULT_BILLING_PERIOD,
      periodDays: dto.periodDays ?? DEFAULT_PERIOD_DAYS,
      sessionsPerMonth:
        resolvedTypeSessions?.totalSessions ??
        normalizeSessionsPerMonth(dto),
      isUnlimited: dto.isUnlimited ?? false,
      guestCount: dto.guestCount ?? 0,
      buttonLabel: dto.buttonLabel?.trim() || 'Buy now',
      features: normalizeFeatures(dto.features),
      isPopular: dto.isPopular ?? false,
      isActive: dto.isActive ?? true,
      displayOrder,
      ...(resolvedTypeSessions !== undefined
        ? { typeSessionAllocations: resolvedTypeSessions.allocations }
        : {}),
    };
  }

  private buildUpdatePlanData(
    dto: UpsertPackagePlanDto,
    current: { slug: string },
    nextSlug: string,
    resolvedTypeSessions: Awaited<
      ReturnType<typeof resolveTypeSessionAllocations>
    > | undefined,
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
      ...this.resolveClassTypeUpdate(dto, resolvedTypeSessions),
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
      ...(dto.sessionsPerMonth !== undefined
        ? { sessionsPerMonth: dto.sessionsPerMonth }
        : resolvedTypeSessions !== undefined
          ? { sessionsPerMonth: resolvedTypeSessions.totalSessions }
          : {}),
      ...(dto.isUnlimited !== undefined
        ? { isUnlimited: dto.isUnlimited }
        : {}),
      ...(dto.guestCount !== undefined ? { guestCount: dto.guestCount } : {}),
      ...(dto.buttonLabel !== undefined
        ? { buttonLabel: dto.buttonLabel.trim() || 'Buy now' }
        : {}),
      ...(dto.features !== undefined
        ? { features: normalizeFeatures(dto.features) }
        : {}),
      ...(dto.isPopular !== undefined ? { isPopular: dto.isPopular } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      ...(dto.displayOrder !== undefined
        ? { displayOrder: dto.displayOrder }
        : {}),
      ...(resolvedTypeSessions !== undefined
        ? { typeSessionAllocations: resolvedTypeSessions.allocations }
        : {}),
    };
  }

  private resolveClassTypeConnect(
    dto: UpsertPackagePlanDto,
    resolvedTypeSessions: Awaited<
      ReturnType<typeof resolveTypeSessionAllocations>
    > | undefined,
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

  private resolveClassTypeUpdate(
    dto: UpsertPackagePlanDto,
    resolvedTypeSessions: Awaited<
      ReturnType<typeof resolveTypeSessionAllocations>
    > | undefined,
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
}
