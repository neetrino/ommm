import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MembershipStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import type { CreatePlanDto } from './dto/create-plan.dto';
import type { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class MembershipsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  listPlans() {
    return this.prisma.membershipPlan.findMany({
      where: { isActive: true },
      orderBy: { priceCents: 'asc' },
    });
  }

  createPlan(dto: CreatePlanDto) {
    return this.prisma.membershipPlan.create({
      data: {
        name: dto.name,
        slug: dto.slug.toLowerCase(),
        description: dto.description,
        priceCents: dto.priceCents,
        sessionsPerMonth: dto.isUnlimited ? null : dto.sessionsPerMonth,
        isUnlimited: dto.isUnlimited,
        periodDays: dto.periodDays,
        stripePriceId: dto.stripePriceId,
      },
    });
  }

  async updatePlan(planId: string, dto: UpdatePlanDto) {
    const data = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.slug !== undefined && { slug: dto.slug.toLowerCase() }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.priceCents !== undefined && { priceCents: dto.priceCents }),
      ...(dto.isUnlimited !== undefined && { isUnlimited: dto.isUnlimited }),
      ...(dto.periodDays !== undefined && { periodDays: dto.periodDays }),
      ...(dto.stripePriceId !== undefined && { stripePriceId: dto.stripePriceId }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    };
    if (dto.isUnlimited === true) {
      Object.assign(data, { sessionsPerMonth: null });
    } else if (dto.sessionsPerMonth !== undefined) {
      Object.assign(data, { sessionsPerMonth: dto.sessionsPerMonth });
    }
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No updatable fields were provided');
    }
    const updated = await this.prisma.membershipPlan.update({
      where: { id: planId },
      data,
    });
    await this.audit.log({
      action: 'MEMBERSHIP_PLAN_UPDATED',
      entityType: 'MembershipPlan',
      entityId: planId,
      payload: data,
    });
    return updated;
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
    return this.prisma.userMembership.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async pause(userId: string, membershipId: string) {
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

  listAllAdmin(options?: { take?: number; offset?: number }) {
    const take = Math.min(Math.max(options?.take ?? 500, 1), 1000);
    const skip = Math.max(options?.offset ?? 0, 0);
    return this.prisma.userMembership.findMany({
      include: {
        plan: true,
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
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
}
