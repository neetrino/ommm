import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { ReconcilePackagesDto } from './dto/reconcile-packages.dto';
import { UpdateCategoryStatusDto } from './dto/update-category-status.dto';
import { UpsertPackagePlanDto } from './dto/upsert-package-plan.dto';
import {
  assertSlugUnique,
  buildCreatePlanData,
  buildUpdatePlanData,
  resolveNextDisplayOrder,
  resolveTypeSessionAllocations,
} from './packages-admin-plan.helpers';
import {
  assertDiscountBounds,
  buildUniqueCategorySlug,
  normalizeCategoryName,
  normalizeSlug,
  requireNonEmptyString,
  toAdminPlanRow,
} from './packages-plan.helpers';
import { USER_PACKAGE_STATUS } from './packages-plan.types';
import { PackageUsageService } from './package-usage.service';
import { PackagesPublicService } from './packages-public.service';
import { countTotalPackagesSold } from './packages-admin-stats';
import { listSoldPackages } from './packages-admin-sold';

@Injectable()
export class PackagesAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly publicService: PackagesPublicService,
    private readonly packageUsage: PackageUsageService,
  ) {}

  async listPlansAdmin() {
    const plans = await this.prisma.packagePlan.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
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

  async getAdminStats() {
    const totalSold = await countTotalPackagesSold(this.prisma);
    return { totalSold };
  }

  listSoldAdmin(query: { take?: number; offset?: number; q?: string }) {
    return listSoldPackages(this.prisma, query);
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
    assertDiscountBounds(dto.priceCents ?? 0, dto.discountedPriceCents ?? null);
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
      data: buildCreatePlanData(
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
        data: buildUpdatePlanData(dto, nextSlug, resolvedTypeSessions),
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
}
