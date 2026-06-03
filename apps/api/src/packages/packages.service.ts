import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  ManualPaymentMethod,
  PackageStatus,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import {
  PUBLIC_CACHE_KEYS,
  PUBLIC_CACHE_TTL_SEC,
} from '../cache/public-cache-keys';
import { RedisCacheService } from '../cache/redis-cache.service';
import { PrismaService } from '../prisma/prisma.service';
import type { CreatePlanDto } from './dto/create-plan.dto';
import type { UpdatePlanDto } from './dto/update-plan.dto';

const MIN_PRORATED_SESSIONS = 1;
const PACKAGE_PAYMENT_SOURCE = 'PACKAGE';

@Injectable()
export class PackagesService {
  private readonly logger = new Logger(PackagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly cache: RedisCacheService,
  ) {}

  async listPlans() {
    return this.cache.getOrSet(
      PUBLIC_CACHE_KEYS.packages,
      PUBLIC_CACHE_TTL_SEC.packages,
      () => this.loadActivePlansFromDb(),
    );
  }

  private async loadActivePlansFromDb() {
    try {
      return await this.prisma.packagePlan.findMany({
        where: { isActive: true },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      });
    } catch (error) {
      if (this.isDatabaseUnreachable(error)) {
        this.logger.warn(
          'Database unreachable (Prisma P1001/P1017); returning empty membership plans for public listing.',
        );
        return [];
      }
      if (!this.isMissingColumn(error)) {
        throw error;
      }
      const legacyPlans = await this.fetchLegacyPlans({ onlyActive: true });
      return legacyPlans.map((plan) => this.withMarketingDefaults(plan));
    }
  }

  async listCategoryNamesAdmin(): Promise<string[]> {
    try {
      const rows = await this.prisma.packagePlan.findMany({
        select: { categoryName: true },
        distinct: ['categoryName'],
        orderBy: { categoryName: 'asc' },
      });
      return this.dedupeCategoryNames(rows.map((row) => row.categoryName));
    } catch (error) {
      if (this.isDatabaseUnreachable(error)) {
        throw new ServiceUnavailableException(
          'Database is unreachable. Wake the Neon branch or fix DATABASE_URL, then retry.',
        );
      }
      if (!this.isMissingColumn(error)) {
        throw error;
      }
      return [];
    }
  }

  async listPlansAdmin() {
    try {
      return await this.prisma.packagePlan.findMany({
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      });
    } catch (error) {
      if (this.isDatabaseUnreachable(error)) {
        throw new ServiceUnavailableException(
          'Database is unreachable. Wake the Neon branch or fix DATABASE_URL, then retry.',
        );
      }
      if (!this.isMissingColumn(error)) {
        throw error;
      }
      const legacyPlans = await this.fetchLegacyPlans({ onlyActive: false });
      return legacyPlans.map((plan) => this.withMarketingDefaults(plan));
    }
  }

  async createPlan(dto: CreatePlanDto) {
    const slug = this.resolveSlug(dto.name, dto.slug);
    const categoryName = await this.resolveCategoryName(dto.categoryName);
    try {
      const plan = await this.prisma.packagePlan.create({
        data: {
          name: dto.name,
          categoryName,
          slug,
          description: dto.description,
          priceCents: dto.priceCents,
          currency: this.normalizeCurrency(dto.currency),
          sessionsPerMonth: dto.isUnlimited ? null : dto.sessionsPerMonth,
          isUnlimited: dto.isUnlimited,
          periodDays: dto.periodDays,
          billingPeriod: this.normalizeBillingPeriod(dto.billingPeriod),
          features: this.normalizeFeatures(dto.features),
          buttonLabel: this.normalizeButtonLabel(dto.buttonLabel),
          isPopular: dto.isPopular ?? false,
          isActive: dto.isActive ?? true,
          displayOrder: dto.displayOrder ?? 0,
          guestCount: this.normalizeGuestCount(dto.guestCount),
        },
      });
      await this.cache.invalidate(PUBLIC_CACHE_KEYS.packages);
      return plan;
    } catch (error) {
      if (this.isUniquePlanConflict(error)) {
        throw new ConflictException(
          'Membership plan with this slug already exists.',
        );
      }
      if (this.getMissingPackagePlanColumn(error) === 'guestCount') {
        const plan = await this.createPlanWithoutGuestCountColumn(
          dto,
          slug,
          categoryName,
        );
        await this.cache.invalidate(PUBLIC_CACHE_KEYS.packages);
        return plan;
      }
      if (!this.isMissingColumn(error)) {
        throw error;
      }
      const legacyPlan = await this.createPlanLegacy(dto, slug, categoryName);
      await this.cache.invalidate(PUBLIC_CACHE_KEYS.packages);
      return this.withMarketingDefaults({
        ...legacyPlan,
        categoryName,
        guestCount: this.normalizeGuestCount(dto.guestCount),
      });
    }
  }

  async updatePlan(planId: string, dto: UpdatePlanDto) {
    if (dto.name === undefined && dto.slug !== undefined) {
      this.assertValidSlug(dto.slug);
    }
    const resolvedCategoryName =
      dto.categoryName !== undefined
        ? await this.resolveCategoryName(dto.categoryName)
        : undefined;
    const data = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(resolvedCategoryName !== undefined && {
        categoryName: resolvedCategoryName,
      }),
      ...(dto.slug !== undefined && { slug: dto.slug.toLowerCase() }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.priceCents !== undefined && { priceCents: dto.priceCents }),
      ...(dto.currency !== undefined && {
        currency: this.normalizeCurrency(dto.currency),
      }),
      ...(dto.isUnlimited !== undefined && { isUnlimited: dto.isUnlimited }),
      ...(dto.periodDays !== undefined && { periodDays: dto.periodDays }),
      ...(dto.billingPeriod !== undefined && {
        billingPeriod: this.normalizeBillingPeriod(dto.billingPeriod),
      }),
      ...(dto.features !== undefined && {
        features: this.normalizeFeatures(dto.features),
      }),
      ...(dto.buttonLabel !== undefined && {
        buttonLabel: this.normalizeButtonLabel(dto.buttonLabel),
      }),
      ...(dto.isPopular !== undefined && { isPopular: dto.isPopular }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      ...(dto.displayOrder !== undefined && { displayOrder: dto.displayOrder }),
      ...(dto.guestCount !== undefined && {
        guestCount: this.normalizeGuestCount(dto.guestCount),
      }),
    };
    if (dto.name !== undefined && dto.slug === undefined) {
      Object.assign(data, { slug: this.resolveSlug(dto.name) });
    }
    if (dto.isUnlimited === true) {
      Object.assign(data, { sessionsPerMonth: null });
    } else if (dto.sessionsPerMonth !== undefined) {
      Object.assign(data, { sessionsPerMonth: dto.sessionsPerMonth });
    }
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No updatable fields were provided');
    }
    let updated;
    try {
      updated = await this.prisma.packagePlan.update({
        where: { id: planId },
        data,
      });
    } catch (error) {
      if (
        this.getMissingPackagePlanColumn(error) === 'guestCount' &&
        'guestCount' in data
      ) {
        const guestCountValue = data.guestCount as number;
        const dataWithoutGuest = { ...data };
        delete dataWithoutGuest.guestCount;
        updated = await this.prisma.packagePlan.update({
          where: { id: planId },
          data: dataWithoutGuest,
        });
        await this.persistGuestCount(planId, guestCountValue);
        updated = await this.loadPlanWithGuestCount(planId, guestCountValue);
      } else if (!this.isMissingColumn(error)) {
        throw error;
      } else {
        throw new InternalServerErrorException(
          'Membership plan migration is not applied. Run database migrations before updating plans.',
        );
      }
    }
    await this.audit.log({
      action: 'MEMBERSHIP_PLAN_UPDATED',
      entityType: 'PackagePlan',
      entityId: planId,
      payload: data,
    });
    await this.cache.invalidate(PUBLIC_CACHE_KEYS.packages);
    return updated;
  }

  async deletePlan(planId: string) {
    const existing = await this.prisma.packagePlan.findUnique({
      where: { id: planId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Plan not found');
    }
    await this.assertPlansDeletable([planId]);
    await this.prisma.packagePlan.delete({ where: { id: planId } });
    await this.audit.log({
      action: 'MEMBERSHIP_PLAN_DELETED',
      entityType: 'PackagePlan',
      entityId: planId,
      payload: {},
    });
    await this.cache.invalidate(PUBLIC_CACHE_KEYS.packages);
    return { ok: true };
  }

  async deletePlansByCategory(
    categoryName: string,
  ): Promise<{ deletedIds: string[] }> {
    const planIds = await this.findPlanIdsByCategoryName(categoryName);
    if (planIds.length === 0) {
      return { deletedIds: [] };
    }
    await this.assertPlansDeletable(planIds);
    await this.prisma.packagePlan.deleteMany({
      where: { id: { in: planIds } },
    });
    await this.audit.log({
      action: 'MEMBERSHIP_PLAN_CATEGORY_DELETED',
      entityType: 'PackagePlan',
      entityId: planIds[0],
      payload: { categoryName, deletedIds: planIds },
    });
    await this.cache.invalidate(PUBLIC_CACHE_KEYS.packages);
    return { deletedIds: planIds };
  }

  private async findPlanIdsByCategoryName(
    categoryName: string,
  ): Promise<string[]> {
    const targetKey = this.categoryComparisonKey(
      this.normalizeCategoryName(categoryName),
    );
    const plans = await this.prisma.packagePlan.findMany({
      select: { id: true, categoryName: true },
    });
    return plans
      .filter(
        (plan) => this.categoryComparisonKey(plan.categoryName) === targetKey,
      )
      .map((plan) => plan.id);
  }

  private async assertPlansDeletable(
    planIds: readonly string[],
  ): Promise<void> {
    if (planIds.length === 0) {
      return;
    }
    const assignedCount = await this.prisma.userPackage.count({
      where: { planId: { in: [...planIds] } },
    });
    if (assignedCount > 0) {
      throw new ConflictException(
        'Cannot delete package plans that are assigned to members.',
      );
    }
  }

  async assignManual(userId: string, planId: string) {
    const plan = await this.prisma.packagePlan.findUnique({
      where: { id: planId },
    });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + plan.periodDays);
    const sessionsRemaining = plan.isUnlimited
      ? null
      : (plan.sessionsPerMonth ?? 0);
    return this.prisma.userPackage.create({
      data: {
        userId,
        planId,
        status: PackageStatus.ACTIVE,
        sessionsRemaining,
        currentPeriodStart: start,
        currentPeriodEnd: end,
      },
      include: { plan: true },
    });
  }

  async subscribeWithManualPayment(
    userId: string,
    planId: string,
    paymentMethod: ManualPaymentMethod,
  ) {
    const plan = await this.prisma.packagePlan.findUnique({
      where: { id: planId },
    });
    if (!plan || !plan.isActive) {
      throw new NotFoundException('Plan not found');
    }
    if (plan.priceCents <= 0) {
      throw new BadRequestException('This plan is not available for purchase');
    }
    const existing = await this.prisma.userPackage.findFirst({
      where: {
        userId,
        planId,
        status: { in: [PackageStatus.ACTIVE, PackageStatus.PENDING] },
      },
    });
    if (existing) {
      throw new ConflictException(
        'You already have an active subscription for this plan',
      );
    }
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + plan.periodDays);
    const sessionsRemaining = plan.isUnlimited
      ? null
      : (plan.sessionsPerMonth ?? 0);
    const userPackage = await this.prisma.$transaction(async (tx) => {
      const created = await tx.userPackage.create({
        data: {
          userId,
          planId,
          status: PackageStatus.PENDING,
          sessionsRemaining,
          currentPeriodStart: start,
          currentPeriodEnd: end,
        },
        include: { plan: true },
      });
      await tx.payment.create({
        data: this.withInternalPaymentCreateFields({
          userId,
          amountCents: plan.priceCents,
          currency: plan.currency.toLowerCase(),
          status: PaymentStatus.PENDING,
          paymentReference: this.createPaymentReference('PACKAGE'),
          source: PACKAGE_PAYMENT_SOURCE,
          sourceId: created.id,
          planId: plan.id,
          userPackageId: created.id,
          paymentMethod,
          description: `Package subscription: ${plan.name}`,
        }),
      });
      return created;
    });
    await this.audit.log({
      actorId: userId,
      actorRole: 'USER',
      action: 'MEMBERSHIP_PAYMENT_REQUESTED',
      entityType: 'UserPackage',
      entityId: userPackage.id,
      payload: { planId, paymentMethod, amountCents: plan.priceCents },
    });
    return userPackage;
  }

  listMine(userId: string) {
    return this.syncExpiredMemberships(userId).then(() =>
      this.prisma.userPackage.findMany({
        where: { userId },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      }),
    );
  }

  async pause(userId: string, userPackageId: string) {
    await this.syncExpiredMemberships(userId);
    const m = await this.prisma.userPackage.findFirst({
      where: { id: userPackageId, userId },
    });
    if (!m) {
      throw new NotFoundException();
    }
    return this.prisma.userPackage.update({
      where: { id: userPackageId },
      data: { status: PackageStatus.PAUSED },
    });
  }

  async cancel(userId: string, userPackageId: string) {
    await this.syncExpiredMemberships(userId);
    const m = await this.prisma.userPackage.findFirst({
      where: { id: userPackageId, userId },
    });
    if (!m) {
      throw new NotFoundException();
    }
    return this.prisma.userPackage.update({
      where: { id: userPackageId },
      data: { status: PackageStatus.CANCELLED },
    });
  }

  async renew(userId: string, userPackageId: string) {
    await this.syncExpiredMemberships(userId);
    const membership = await this.prisma.userPackage.findFirst({
      where: { id: userPackageId, userId },
      include: { plan: true },
    });
    if (!membership) {
      throw new NotFoundException();
    }
    if (membership.status === PackageStatus.ACTIVE) {
      throw new BadRequestException('Membership is already active');
    }
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + membership.plan.periodDays);
    const sessionsRemaining = membership.plan.isUnlimited
      ? null
      : (membership.plan.sessionsPerMonth ?? 0);
    const renewed = await this.prisma.userPackage.update({
      where: { id: userPackageId },
      data: {
        status: PackageStatus.ACTIVE,
        currentPeriodStart: start,
        currentPeriodEnd: end,
        sessionsRemaining,
      },
      include: { plan: true },
    });
    await this.audit.log({
      actorId: userId,
      actorRole: 'USER',
      action: 'MEMBERSHIP_RENEWED',
      entityType: 'UserPackage',
      entityId: userPackageId,
      payload: { planId: renewed.planId },
    });
    return renewed;
  }

  async changePlan(userId: string, userPackageId: string, nextPlanId: string) {
    await this.syncExpiredMemberships(userId);
    const [membership, plan] = await Promise.all([
      this.prisma.userPackage.findFirst({
        where: { id: userPackageId, userId },
        include: { plan: true },
      }),
      this.prisma.packagePlan.findUnique({ where: { id: nextPlanId } }),
    ]);
    if (!membership) {
      throw new NotFoundException();
    }
    if (!plan || !plan.isActive) {
      throw new NotFoundException('Target plan not found');
    }
    if (membership.planId === plan.id) {
      throw new BadRequestException('Membership already uses this plan');
    }
    const now = new Date();
    const planChangePolicy = this.resolvePlanChangePolicy({
      membership,
      plan,
      now,
    });
    const updated = await this.prisma.userPackage.update({
      where: { id: userPackageId },
      data: {
        planId: plan.id,
        status: PackageStatus.ACTIVE,
        currentPeriodStart: planChangePolicy.currentPeriodStart,
        currentPeriodEnd: planChangePolicy.currentPeriodEnd,
        sessionsRemaining: planChangePolicy.sessionsRemaining,
      },
      include: { plan: true },
    });
    const prorationAdjustment = this.calculateProrationAdjustmentCents({
      oldPriceCents: membership.plan.priceCents,
      newPriceCents: plan.priceCents,
      remainingRatio: planChangePolicy.remainingRatio,
      prorationApplied: planChangePolicy.prorationApplied,
    });
    if (prorationAdjustment !== 0) {
      await this.prisma.payment.create({
        data: {
          userId,
          amountCents: prorationAdjustment,
          currency: plan.currency.toLowerCase(),
          status: PaymentStatus.SUCCEEDED,
          description:
            prorationAdjustment > 0
              ? `Membership plan proration charge (${membership.planId} -> ${plan.id})`
              : `Membership plan proration credit (${membership.planId} -> ${plan.id})`,
        },
      });
    }
    await this.audit.log({
      actorId: userId,
      actorRole: 'USER',
      action: 'MEMBERSHIP_PLAN_CHANGED',
      entityType: 'UserPackage',
      entityId: userPackageId,
      payload: {
        fromPlanId: membership.planId,
        toPlanId: plan.id,
        prorationApplied: planChangePolicy.prorationApplied,
        prorationAdjustmentCents: prorationAdjustment,
      },
    });
    return updated;
  }

  listAllAdmin(options?: { take?: number; offset?: number }) {
    const take = Math.min(Math.max(options?.take ?? 500, 1), 1000);
    const skip = Math.max(options?.offset ?? 0, 0);
    return this.syncExpiredMemberships().then(() =>
      this.prisma.userPackage.findMany({
        include: {
          plan: true,
          user: { select: { id: true, email: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
    );
  }

  private async syncExpiredMemberships(userId?: string) {
    await this.prisma.userPackage.updateMany({
      where: {
        ...(userId ? { userId } : {}),
        status: PackageStatus.ACTIVE,
        currentPeriodEnd: { lte: new Date() },
      },
      data: { status: PackageStatus.EXPIRED },
    });
  }

  async adminSetStatus(userPackageId: string, status: PackageStatus) {
    const updated = await this.prisma.userPackage.update({
      where: { id: userPackageId },
      data: { status },
      include: { plan: true, user: { select: { email: true } } },
    });
    await this.audit.log({
      action: 'MEMBERSHIP_STATUS_UPDATED',
      entityType: 'UserPackage',
      entityId: userPackageId,
      payload: { status },
    });
    return updated;
  }

  private resolveSlug(name: string, rawSlug?: string): string {
    const source = rawSlug?.trim().length ? rawSlug : name;
    const slug = source
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (slug.length === 0) {
      throw new BadRequestException('Slug is required');
    }
    return slug.slice(0, 120);
  }

  private assertValidSlug(rawSlug: string): void {
    const normalized = this.resolveSlug(rawSlug, rawSlug);
    if (normalized !== rawSlug.toLowerCase().trim()) {
      throw new BadRequestException('Invalid slug format');
    }
  }

  private normalizeCurrency(currency?: string): string {
    const fallback = 'USD';
    if (currency === undefined) {
      return fallback;
    }
    const normalized = currency.trim().toUpperCase();
    return normalized.length > 0 ? normalized : fallback;
  }

  private normalizeBillingPeriod(period?: string): string {
    const fallback = 'monthly';
    if (period === undefined) {
      return fallback;
    }
    const normalized = period.trim().toLowerCase();
    return normalized.length > 0 ? normalized : fallback;
  }

  private normalizeCategoryName(name: string): string {
    const normalized = name.trim().replace(/\s+/g, ' ');
    if (normalized.length === 0) {
      throw new BadRequestException('Package category is required.');
    }
    return normalized;
  }

  private categoryComparisonKey(name: string): string {
    return this.normalizeCategoryName(name).toLocaleLowerCase();
  }

  private dedupeCategoryNames(names: readonly string[]): string[] {
    const byKey = new Map<string, string>();
    for (const rawName of names) {
      const label = this.normalizeCategoryName(rawName);
      const key = this.categoryComparisonKey(label);
      if (!byKey.has(key)) {
        byKey.set(key, label);
      }
    }
    return [...byKey.values()].sort((left, right) => left.localeCompare(right));
  }

  private async resolveCategoryName(name: string): Promise<string> {
    const normalized = this.normalizeCategoryName(name);
    const key = this.categoryComparisonKey(normalized);
    const existing = await this.prisma.packagePlan.findMany({
      select: { categoryName: true },
      distinct: ['categoryName'],
    });
    for (const row of existing) {
      if (this.categoryComparisonKey(row.categoryName) === key) {
        return this.normalizeCategoryName(row.categoryName);
      }
    }
    return normalized;
  }

  private normalizeGuestCount(count?: number): number {
    const MAX_GUEST_COUNT = 99;
    if (count === undefined) {
      return 0;
    }
    if (!Number.isInteger(count) || count < 0 || count > MAX_GUEST_COUNT) {
      throw new BadRequestException(
        `Guest count must be an integer from 0 to ${MAX_GUEST_COUNT}.`,
      );
    }
    return count;
  }

  private normalizeButtonLabel(label?: string): string {
    const fallback = 'Choose plan';
    if (label === undefined) {
      return fallback;
    }
    const normalized = label.trim();
    return normalized.length > 0 ? normalized : fallback;
  }

  private normalizeFeatures(features?: string[]): string[] {
    if (features === undefined) {
      return [];
    }
    return features
      .map((feature) => feature.trim())
      .filter((feature) => feature.length > 0)
      .slice(0, 20);
  }

  private resolvePlanChangePolicy(params: {
    membership: {
      status: PackageStatus;
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
    };
    plan: {
      isUnlimited: boolean;
      sessionsPerMonth: number | null;
      periodDays: number;
    };
    now: Date;
  }): {
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    sessionsRemaining: number | null;
    prorationApplied: boolean;
    remainingRatio: number;
  } {
    const shouldProrate =
      params.membership.status === PackageStatus.ACTIVE &&
      params.membership.currentPeriodEnd > params.now &&
      params.membership.currentPeriodEnd > params.membership.currentPeriodStart;
    if (!shouldProrate) {
      const start = params.now;
      const end = this.addDays(start, params.plan.periodDays);
      return {
        currentPeriodStart: start,
        currentPeriodEnd: end,
        sessionsRemaining: this.resolvePlanSessions(params.plan, 1),
        prorationApplied: false,
        remainingRatio: 1,
      };
    }
    const ratio = this.calculateRemainingRatio(
      params.membership.currentPeriodStart,
      params.membership.currentPeriodEnd,
      params.now,
    );
    return {
      currentPeriodStart: params.membership.currentPeriodStart,
      currentPeriodEnd: params.membership.currentPeriodEnd,
      sessionsRemaining: this.resolvePlanSessions(params.plan, ratio),
      prorationApplied: true,
      remainingRatio: ratio,
    };
  }

  private calculateProrationAdjustmentCents(params: {
    oldPriceCents: number;
    newPriceCents: number;
    remainingRatio: number;
    prorationApplied: boolean;
  }): number {
    if (!params.prorationApplied) {
      return 0;
    }
    const delta = params.newPriceCents - params.oldPriceCents;
    return Math.round(delta * params.remainingRatio);
  }

  private resolvePlanSessions(
    plan: { isUnlimited: boolean; sessionsPerMonth: number | null },
    ratio: number,
  ): number | null {
    if (plan.isUnlimited) {
      return null;
    }
    const baseSessions = plan.sessionsPerMonth ?? 0;
    if (baseSessions === 0) {
      return 0;
    }
    const prorated = Math.ceil(baseSessions * ratio);
    return Math.max(MIN_PRORATED_SESSIONS, prorated);
  }

  private calculateRemainingRatio(start: Date, end: Date, now: Date): number {
    const totalMs = end.getTime() - start.getTime();
    if (totalMs <= 0) {
      return 1;
    }
    const remainingMs = Math.max(0, end.getTime() - now.getTime());
    return Math.min(1, remainingMs / totalMs);
  }

  private addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }

  /** Prisma: P1001 can't reach server; P1017 server closed connection (e.g. idle Neon). */
  private isDatabaseUnreachable(error: unknown): boolean {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
      return false;
    }
    const code = (error as { code?: unknown }).code;
    return code === 'P1001' || code === 'P1017';
  }

  private getMissingPackagePlanColumn(error: unknown): string | null {
    if (typeof error !== 'object' || error === null) {
      return null;
    }
    if (!('code' in error) || !('meta' in error)) {
      return null;
    }
    const code = (error as { code?: unknown }).code;
    const meta = (error as { meta?: unknown }).meta;
    if (code !== 'P2022' || typeof meta !== 'object' || meta === null) {
      return null;
    }
    const column = (meta as { column?: unknown }).column;
    if (typeof column !== 'string') {
      return null;
    }
    return column.replace(/^PackagePlan\./, '');
  }

  private isMissingColumn(error: unknown): boolean {
    const normalizedColumn = this.getMissingPackagePlanColumn(error);
    if (normalizedColumn === null) {
      return false;
    }
    return [
      'currency',
      'billingPeriod',
      'features',
      'buttonLabel',
      'isPopular',
      'displayOrder',
      'categoryName',
    ].includes(normalizedColumn);
  }

  private async persistGuestCount(
    planId: string,
    guestCount: number,
  ): Promise<boolean> {
    try {
      await this.prisma.$executeRaw(
        Prisma.sql`
          UPDATE "PackagePlan"
          SET "guestCount" = ${guestCount}
          WHERE "id" = ${planId}
        `,
      );
      return true;
    } catch (error) {
      this.logger.warn(
        `Could not persist guestCount for plan ${planId}. Apply package guest-count migration.`,
        error instanceof Error ? error.message : String(error),
      );
      return false;
    }
  }

  private async loadPlanWithGuestCount(
    planId: string,
    guestCountFallback: number,
  ) {
    const plan = await this.prisma.packagePlan.findUnique({
      where: { id: planId },
    });
    if (plan === null) {
      throw new NotFoundException('Plan not found');
    }
    if (typeof plan.guestCount === 'number') {
      return plan;
    }
    return { ...plan, guestCount: guestCountFallback };
  }

  private async createPlanWithoutGuestCountColumn(
    dto: CreatePlanDto,
    slug: string,
    categoryName: string,
  ) {
    const guestCount = this.normalizeGuestCount(dto.guestCount);
    const plan = await this.prisma.packagePlan.create({
      data: {
        name: dto.name,
        categoryName,
        slug,
        description: dto.description,
        priceCents: dto.priceCents,
        currency: this.normalizeCurrency(dto.currency),
        sessionsPerMonth: dto.isUnlimited ? null : dto.sessionsPerMonth,
        isUnlimited: dto.isUnlimited,
        periodDays: dto.periodDays,
        billingPeriod: this.normalizeBillingPeriod(dto.billingPeriod),
        features: this.normalizeFeatures(dto.features),
        buttonLabel: this.normalizeButtonLabel(dto.buttonLabel),
        isPopular: dto.isPopular ?? false,
        isActive: dto.isActive ?? true,
        displayOrder: dto.displayOrder ?? 0,
      },
    });
    const persisted = await this.persistGuestCount(plan.id, guestCount);
    if (persisted) {
      return { ...plan, guestCount };
    }
    return this.withMarketingDefaults({ ...plan, guestCount });
  }

  private async createPlanLegacy(
    dto: CreatePlanDto,
    slug: string,
    categoryName: string,
  ) {
    try {
      const planId = randomUUID();
      const now = new Date();
      const guestCount = this.normalizeGuestCount(dto.guestCount);
      const created = await this.prisma.$queryRaw<
        Array<{
          id: string;
          name: string;
          slug: string;
          description: string | null;
          priceCents: number;
          sessionsPerMonth: number | null;
          isUnlimited: boolean;
          periodDays: number;
          isActive: boolean;
          createdAt: Date;
          updatedAt: Date;
        }>
      >(Prisma.sql`
        INSERT INTO "PackagePlan" (
          "id",
          "name",
          "categoryName",
          "slug",
          "description",
          "priceCents",
          "sessionsPerMonth",
          "isUnlimited",
          "periodDays",
          "guestCount",
          "isActive",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          ${planId},
          ${dto.name},
          ${categoryName},
          ${slug},
          ${dto.description ?? null},
          ${dto.priceCents},
          ${dto.isUnlimited ? null : (dto.sessionsPerMonth ?? null)},
          ${dto.isUnlimited},
          ${dto.periodDays},
          ${guestCount},
          ${dto.isActive ?? true},
          ${now},
          ${now}
        )
        RETURNING
          "id",
          "name",
          "slug",
          "description",
          "priceCents",
          "sessionsPerMonth",
          "isUnlimited",
          "periodDays",
          "isActive",
          "createdAt",
          "updatedAt"
      `);
      const [plan] = created;
      if (plan === undefined) {
        throw new InternalServerErrorException(
          'Failed to create membership plan',
        );
      }
      await this.persistGuestCount(plan.id, guestCount);
      return this.withMarketingDefaults({ ...plan, categoryName, guestCount });
    } catch (error) {
      if (this.isUniquePlanConflict(error)) {
        throw new ConflictException(
          'Membership plan with this slug already exists.',
        );
      }
      throw new InternalServerErrorException(
        'Could not create membership plan in legacy schema. Apply membership migrations and retry.',
      );
    }
  }

  private isUniquePlanConflict(error: unknown): boolean {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
      return false;
    }
    const code = (error as { code?: unknown }).code;
    if (code === 'P2002') {
      return true;
    }
    if (code !== 'P2010' || !('meta' in error)) {
      return false;
    }
    const meta = (error as { meta?: unknown }).meta;
    if (typeof meta !== 'object' || meta === null || !('code' in meta)) {
      return false;
    }
    return (meta as { code?: unknown }).code === '23505';
  }

  private withMarketingDefaults<
    T extends object & {
      categoryName?: string;
      currency?: string;
      billingPeriod?: string;
      features?: string[];
      buttonLabel?: string;
      isPopular?: boolean;
      displayOrder?: number;
      guestCount?: number;
    },
  >(
    plan: T,
  ): T & {
    categoryName: string;
    currency: string;
    billingPeriod: string;
    features: string[];
    buttonLabel: string;
    isPopular: boolean;
    displayOrder: number;
    guestCount: number;
  } {
    const categoryRaw =
      'categoryName' in plan && typeof plan.categoryName === 'string'
        ? plan.categoryName
        : 'General';
    return {
      ...plan,
      categoryName:
        categoryRaw.trim().length > 0 ? categoryRaw.trim() : 'General',
      currency: this.normalizeCurrency(plan.currency),
      billingPeriod: this.normalizeBillingPeriod(plan.billingPeriod),
      features: this.normalizeFeatures(plan.features),
      buttonLabel: this.normalizeButtonLabel(plan.buttonLabel),
      isPopular: plan.isPopular ?? false,
      displayOrder: plan.displayOrder ?? 0,
      guestCount:
        'guestCount' in plan && typeof plan.guestCount === 'number'
          ? this.normalizeGuestCount(plan.guestCount)
          : 0,
    };
  }

  private createPaymentReference(prefix: string): string {
    return `${prefix}-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
  }

  private withInternalPaymentCreateFields<T extends Record<string, unknown>>(
    data: T,
  ): Prisma.PaymentUncheckedCreateInput {
    return data as unknown as Prisma.PaymentUncheckedCreateInput;
  }

  private fetchLegacyPlans(options: { onlyActive: boolean }) {
    const baseQuery = Prisma.sql`
      SELECT
        "id",
        "name",
        "slug",
        "description",
        "priceCents",
        "sessionsPerMonth",
        "isUnlimited",
        "periodDays",
        "isActive",
        "createdAt",
        "updatedAt"
      FROM "PackagePlan"
    `;
    const where = options.onlyActive
      ? Prisma.sql` WHERE "isActive" = true`
      : Prisma.empty;
    const order = Prisma.sql` ORDER BY "createdAt" ASC`;
    return this.prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        priceCents: number;
        sessionsPerMonth: number | null;
        isUnlimited: boolean;
        periodDays: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
      }>
    >(Prisma.sql`${baseQuery}${where}${order}`);
  }
}
