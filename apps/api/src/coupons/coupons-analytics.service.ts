import { Injectable } from '@nestjs/common';
import { CouponRedemptionStatus, type Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { deriveCouponDisplayStatus } from './coupon-status.util';
import type { ListCouponAnalyticsQueryDto } from './dto/list-coupon-analytics.dto';

const ANALYTICS_TAKE = 200;

@Injectable()
export class CouponsAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListCouponAnalyticsQueryDto) {
    const userId = await this.resolveUserId(query.userEmail);
    if (query.userEmail && userId === null) {
      return { items: [] };
    }
    const couponIds = await this.matchingCouponIds(query);
    if (couponIds.length === 0) {
      return { items: [] };
    }
    const rows = await this.prisma.couponRedemption.findMany({
      where: {
        status: CouponRedemptionStatus.APPLIED,
        couponId: { in: couponIds },
        ...(userId ? { userId } : {}),
        ...appliedRange(query),
      },
      include: redemptionInclude(),
      orderBy: { appliedAt: 'desc' },
      take: ANALYTICS_TAKE,
    });
    return { items: rows.map(toAnalyticsRow) };
  }

  private async resolveUserId(
    email: string | undefined,
  ): Promise<string | null> {
    const normalized = email?.trim().toLowerCase() ?? '';
    if (normalized.length === 0) {
      return null;
    }
    const user = await this.prisma.user.findUnique({
      where: { email: normalized },
      select: { id: true },
    });
    return user?.id ?? null;
  }

  private async matchingCouponIds(
    query: ListCouponAnalyticsQueryDto,
  ): Promise<string[]> {
    const coupons = await this.prisma.coupon.findMany({
      where: {
        ...(query.couponId ? { id: query.couponId } : {}),
        ...(query.discountType ? { discountType: query.discountType } : {}),
        ...(query.creatorId ? { createdById: query.creatorId } : {}),
      },
      select: {
        id: true,
        status: true,
        validUntil: true,
        totalUsageLimit: true,
      },
    });
    if (query.status === undefined) {
      return coupons.map((row) => row.id);
    }
    const used = await openUseCounts(
      this.prisma,
      coupons.map((row) => row.id),
    );
    const now = new Date();
    return coupons
      .filter(
        (row) =>
          deriveCouponDisplayStatus({
            status: row.status,
            validUntil: row.validUntil,
            totalUsageLimit: row.totalUsageLimit,
            usedCount: used.get(row.id) ?? 0,
            now,
          }) === query.status,
      )
      .map((row) => row.id);
  }
}

async function openUseCounts(
  prisma: PrismaService,
  ids: string[],
): Promise<Map<string, number>> {
  if (ids.length === 0) {
    return new Map();
  }
  const groups = await prisma.couponRedemption.groupBy({
    by: ['couponId'],
    where: {
      couponId: { in: ids },
      status: {
        in: [CouponRedemptionStatus.RESERVED, CouponRedemptionStatus.APPLIED],
      },
    },
    _count: { _all: true },
  });
  return new Map(groups.map((row) => [row.couponId, row._count._all]));
}

function appliedRange(
  query: ListCouponAnalyticsQueryDto,
): Prisma.CouponRedemptionWhereInput {
  if (query.from === undefined && query.to === undefined) {
    return {};
  }
  return {
    appliedAt: {
      ...(query.from ? { gte: new Date(query.from) } : {}),
      ...(query.to ? { lte: new Date(query.to) } : {}),
    },
  };
}

function redemptionInclude() {
  return {
    user: { select: { id: true, email: true, name: true, lastName: true } },
    coupon: {
      select: {
        id: true,
        code: true,
        discountType: true,
        createdBy: {
          select: { id: true, email: true, name: true, lastName: true },
        },
      },
    },
    payment: {
      select: { id: true, description: true, source: true, amountCents: true },
    },
  } satisfies Prisma.CouponRedemptionInclude;
}

function toAnalyticsRow(
  row: Prisma.CouponRedemptionGetPayload<{
    include: ReturnType<typeof redemptionInclude>;
  }>,
) {
  return {
    id: row.id,
    usedAt: row.appliedAt?.toISOString() ?? row.createdAt.toISOString(),
    couponId: row.coupon.id,
    code: row.code,
    discountType: row.discountType,
    discountValue: row.discountValue,
    originalAmountCents: row.originalAmountCents,
    discountAmountCents: row.discountAmountCents,
    finalAmountCents: row.payment.amountCents,
    purchase: row.payment.description,
    source: row.payment.source,
    createdBy: row.coupon.createdBy,
    user: row.user,
  };
}
