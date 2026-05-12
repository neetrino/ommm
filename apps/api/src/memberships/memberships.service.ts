import { Injectable, NotFoundException } from '@nestjs/common';
import { MembershipStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreatePlanDto } from './dto/create-plan.dto';

@Injectable()
export class MembershipsService {
  constructor(private readonly prisma: PrismaService) {}

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

  listAllAdmin() {
    return this.prisma.userMembership.findMany({
      include: {
        plan: true,
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  async adminSetStatus(membershipId: string, status: MembershipStatus) {
    return this.prisma.userMembership.update({
      where: { id: membershipId },
      data: { status },
      include: { plan: true, user: { select: { email: true } } },
    });
  }
}
