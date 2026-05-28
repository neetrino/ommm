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
import { MembershipStatus, Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import type { CreatePlanDto } from './dto/create-plan.dto';
import type { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class MembershipsService {
  private readonly logger = new Logger(MembershipsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listPlans() {
    try {
      return await this.prisma.membershipPlan.findMany({
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

  async listPlansAdmin() {
    try {
      return await this.prisma.membershipPlan.findMany({
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
    try {
      return await this.prisma.membershipPlan.create({
        data: {
          name: dto.name,
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
          stripePriceId: dto.stripePriceId,
        },
      });
    } catch (error) {
      if (this.isUniquePlanConflict(error)) {
        throw new ConflictException(
          'Membership plan with this slug already exists.',
        );
      }
      if (!this.isMissingColumn(error)) {
        throw error;
      }
      return this.createPlanLegacy(dto, slug);
    }
  }

  async updatePlan(planId: string, dto: UpdatePlanDto) {
    if (dto.name === undefined && dto.slug !== undefined) {
      this.assertValidSlug(dto.slug);
    }
    const data = {
      ...(dto.name !== undefined && { name: dto.name }),
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
      ...(dto.stripePriceId !== undefined && {
        stripePriceId: dto.stripePriceId,
      }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      ...(dto.displayOrder !== undefined && { displayOrder: dto.displayOrder }),
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
      updated = await this.prisma.membershipPlan.update({
        where: { id: planId },
        data,
      });
    } catch (error) {
      if (!this.isMissingColumn(error)) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Membership plan migration is not applied. Run database migrations before updating plans.',
      );
    }
    await this.audit.log({
      action: 'MEMBERSHIP_PLAN_UPDATED',
      entityType: 'MembershipPlan',
      entityId: planId,
      payload: data,
    });
    return updated;
  }

  async deletePlan(planId: string) {
    const existing = await this.prisma.membershipPlan.findUnique({
      where: { id: planId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Plan not found');
    }
    await this.prisma.membershipPlan.delete({ where: { id: planId } });
    await this.audit.log({
      action: 'MEMBERSHIP_PLAN_DELETED',
      entityType: 'MembershipPlan',
      entityId: planId,
      payload: {},
    });
    return { ok: true };
  }

  async assignManual(userId: string, planId: string) {
    const plan = await this.prisma.membershipPlan.findUnique({
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
    return this.prisma.userMembership.create({
      data: {
        userId,
        planId,
        status: MembershipStatus.ACTIVE,
        sessionsRemaining,
        currentPeriodStart: start,
        currentPeriodEnd: end,
      },
      include: { plan: true },
    });
  }

  listMine(userId: string) {
    return this.syncExpiredMemberships(userId).then(() =>
      this.prisma.userMembership.findMany({
        where: { userId },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      }),
    );
  }

  async pause(userId: string, membershipId: string) {
    await this.syncExpiredMemberships(userId);
    const m = await this.prisma.userMembership.findFirst({
      where: { id: membershipId, userId },
    });
    if (!m) {
      throw new NotFoundException();
    }
    return this.prisma.userMembership.update({
      where: { id: membershipId },
      data: { status: MembershipStatus.PAUSED },
    });
  }

  async cancel(userId: string, membershipId: string) {
    await this.syncExpiredMemberships(userId);
    const m = await this.prisma.userMembership.findFirst({
      where: { id: membershipId, userId },
    });
    if (!m) {
      throw new NotFoundException();
    }
    return this.prisma.userMembership.update({
      where: { id: membershipId },
      data: { status: MembershipStatus.CANCELLED },
    });
  }

  async renew(userId: string, membershipId: string) {
    await this.syncExpiredMemberships(userId);
    const membership = await this.prisma.userMembership.findFirst({
      where: { id: membershipId, userId },
      include: { plan: true },
    });
    if (!membership) {
      throw new NotFoundException();
    }
    if (membership.status === MembershipStatus.ACTIVE) {
      throw new BadRequestException('Membership is already active');
    }
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + membership.plan.periodDays);
    const sessionsRemaining = membership.plan.isUnlimited
      ? null
      : (membership.plan.sessionsPerMonth ?? 0);
    const renewed = await this.prisma.userMembership.update({
      where: { id: membershipId },
      data: {
        status: MembershipStatus.ACTIVE,
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
      entityType: 'UserMembership',
      entityId: membershipId,
      payload: { planId: renewed.planId },
    });
    return renewed;
  }

  async changePlan(userId: string, membershipId: string, nextPlanId: string) {
    await this.syncExpiredMemberships(userId);
    const [membership, plan] = await Promise.all([
      this.prisma.userMembership.findFirst({
        where: { id: membershipId, userId },
        include: { plan: true },
      }),
      this.prisma.membershipPlan.findUnique({ where: { id: nextPlanId } }),
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
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + plan.periodDays);
    const sessionsRemaining = plan.isUnlimited ? null : (plan.sessionsPerMonth ?? 0);
    const updated = await this.prisma.userMembership.update({
      where: { id: membershipId },
      data: {
        planId: plan.id,
        status: MembershipStatus.ACTIVE,
        currentPeriodStart: start,
        currentPeriodEnd: end,
        sessionsRemaining,
      },
      include: { plan: true },
    });
    await this.audit.log({
      actorId: userId,
      actorRole: 'USER',
      action: 'MEMBERSHIP_PLAN_CHANGED',
      entityType: 'UserMembership',
      entityId: membershipId,
      payload: { fromPlanId: membership.planId, toPlanId: plan.id },
    });
    return updated;
  }

  listAllAdmin(options?: { take?: number; offset?: number }) {
    const take = Math.min(Math.max(options?.take ?? 500, 1), 1000);
    const skip = Math.max(options?.offset ?? 0, 0);
    return this.syncExpiredMemberships().then(() =>
      this.prisma.userMembership.findMany({
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
    await this.prisma.userMembership.updateMany({
      where: {
        ...(userId ? { userId } : {}),
        status: MembershipStatus.ACTIVE,
        currentPeriodEnd: { lte: new Date() },
      },
      data: { status: MembershipStatus.EXPIRED },
    });
  }

  async adminSetStatus(membershipId: string, status: MembershipStatus) {
    const updated = await this.prisma.userMembership.update({
      where: { id: membershipId },
      data: { status },
      include: { plan: true, user: { select: { email: true } } },
    });
    await this.audit.log({
      action: 'MEMBERSHIP_STATUS_UPDATED',
      entityType: 'UserMembership',
      entityId: membershipId,
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

  /** Prisma: P1001 can't reach server; P1017 server closed connection (e.g. idle Neon). */
  private isDatabaseUnreachable(error: unknown): boolean {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
      return false;
    }
    const code = (error as { code?: unknown }).code;
    return code === 'P1001' || code === 'P1017';
  }

  private isMissingColumn(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }
    if (!('code' in error) || !('meta' in error)) {
      return false;
    }
    const code = (error as { code?: unknown }).code;
    const meta = (error as { meta?: unknown }).meta;
    if (code !== 'P2022' || typeof meta !== 'object' || meta === null) {
      return false;
    }
    const column = (meta as { column?: unknown }).column;
    if (typeof column !== 'string') {
      return false;
    }
    const normalizedColumn = column.replace(/^MembershipPlan\./, '');
    return [
      'currency',
      'billingPeriod',
      'features',
      'buttonLabel',
      'isPopular',
      'displayOrder',
    ].includes(normalizedColumn);
  }

  private async createPlanLegacy(dto: CreatePlanDto, slug: string) {
    try {
      const planId = randomUUID();
      const now = new Date();
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
          stripePriceId: string | null;
          createdAt: Date;
          updatedAt: Date;
        }>
      >(Prisma.sql`
        INSERT INTO "MembershipPlan" (
          "id",
          "name",
          "slug",
          "description",
          "priceCents",
          "sessionsPerMonth",
          "isUnlimited",
          "periodDays",
          "isActive",
          "stripePriceId",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          ${planId},
          ${dto.name},
          ${slug},
          ${dto.description ?? null},
          ${dto.priceCents},
          ${dto.isUnlimited ? null : (dto.sessionsPerMonth ?? null)},
          ${dto.isUnlimited},
          ${dto.periodDays},
          ${dto.isActive ?? true},
          ${dto.stripePriceId ?? null},
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
          "stripePriceId",
          "createdAt",
          "updatedAt"
      `);
      const [plan] = created;
      if (plan === undefined) {
        throw new InternalServerErrorException(
          'Failed to create membership plan',
        );
      }
      return this.withMarketingDefaults(plan);
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
      currency?: string;
      billingPeriod?: string;
      features?: string[];
      buttonLabel?: string;
      isPopular?: boolean;
      displayOrder?: number;
    },
  >(
    plan: T,
  ): T & {
    currency: string;
    billingPeriod: string;
    features: string[];
    buttonLabel: string;
    isPopular: boolean;
    displayOrder: number;
  } {
    return {
      ...plan,
      currency: this.normalizeCurrency(plan.currency),
      billingPeriod: this.normalizeBillingPeriod(plan.billingPeriod),
      features: this.normalizeFeatures(plan.features),
      buttonLabel: this.normalizeButtonLabel(plan.buttonLabel),
      isPopular: plan.isPopular ?? false,
      displayOrder: plan.displayOrder ?? 0,
    };
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
        "stripePriceId",
        "createdAt",
        "updatedAt"
      FROM "MembershipPlan"
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
        stripePriceId: string | null;
        createdAt: Date;
        updatedAt: Date;
      }>
    >(Prisma.sql`${baseQuery}${where}${order}`);
  }
}
