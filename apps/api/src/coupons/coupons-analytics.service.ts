import { Injectable } from '@nestjs/common';
import { type Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { readPackagePlanIdFromMetadata } from '../packages/package-payment-metadata.util';
import { readCartCheckout } from '../payments/payments-cart.fulfill';
import {
  collectCouponPurchaseIds,
  COUNTED_COUPON_USE_STATUSES,
  couponAnalyticsTimeWhere,
  couponPurchaseLabel,
  sessionDisplayName,
} from './coupon-analytics.util';
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
        status: { in: [...COUNTED_COUPON_USE_STATUSES] },
        couponId: { in: couponIds },
        ...(userId ? { userId } : {}),
        ...couponAnalyticsTimeWhere(query),
      },
      include: redemptionInclude(),
      orderBy: { createdAt: 'desc' },
      take: ANALYTICS_TAKE,
    });
    const purchases = await this.purchaseLabels(rows);
    return {
      items: rows.map((row) =>
        toAnalyticsRow(row, purchases.get(row.id) ?? null),
      ),
    };
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

  private async purchaseLabels(
    rows: RedemptionRow[],
  ): Promise<Map<string, string | null>> {
    const names = await this.purchaseNameMaps(rows);
    return new Map(
      rows.map((row) => [row.id, labelFromPayment(row.payment, names)]),
    );
  }

  private async purchaseNameMaps(
    rows: RedemptionRow[],
  ): Promise<PurchaseNameMaps> {
    const ids = collectCouponPurchaseIds(rows.map((row) => row.payment));
    const [packages, sessions, plans, bars] = await Promise.all([
      this.prisma.userPackage.findMany({
        where: { id: { in: ids.userPackageIds } },
        select: { id: true, planNameSnapshot: true },
      }),
      this.prisma.classSession.findMany({
        where: { id: { in: ids.sessionIds } },
        select: {
          id: true,
          title: true,
          classType: { select: { name: true } },
        },
      }),
      this.prisma.packagePlan.findMany({
        where: { id: { in: ids.planIds } },
        select: { id: true, name: true },
      }),
      this.prisma.barProduct.findMany({
        where: { id: { in: ids.barProductIds } },
        select: { id: true, name: true },
      }),
    ]);
    return {
      packages: new Map(packages.map((row) => [row.id, row.planNameSnapshot])),
      sessions: new Map(
        sessions.map((row) => [
          row.id,
          sessionDisplayName({
            title: row.title,
            classTypeName: row.classType.name,
          }),
        ]),
      ),
      plans: new Map(plans.map((row) => [row.id, row.name])),
      bars: new Map(bars.map((row) => [row.id, row.name])),
    };
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
      status: { in: [...COUNTED_COUPON_USE_STATUSES] },
    },
    _count: { _all: true },
  });
  return new Map(groups.map((row) => [row.couponId, row._count._all]));
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
      select: {
        id: true,
        description: true,
        source: true,
        sourceId: true,
        metadata: true,
        amountCents: true,
      },
    },
  } satisfies Prisma.CouponRedemptionInclude;
}

type RedemptionRow = Prisma.CouponRedemptionGetPayload<{
  include: ReturnType<typeof redemptionInclude>;
}>;

type PurchaseNameMaps = {
  packages: Map<string, string>;
  sessions: Map<string, string | null>;
  plans: Map<string, string>;
  bars: Map<string, string>;
};

function toAnalyticsRow(row: RedemptionRow, purchase: string | null) {
  return {
    id: row.id,
    usedAt: row.appliedAt?.toISOString() ?? row.createdAt.toISOString(),
    redemptionStatus: row.status,
    couponId: row.coupon.id,
    code: row.code,
    discountType: row.discountType,
    discountValue: row.discountValue,
    originalAmountCents: row.originalAmountCents,
    discountAmountCents: row.discountAmountCents,
    finalAmountCents: row.payment.amountCents,
    purchase,
    source: row.payment.source,
    createdBy: row.coupon.createdBy,
    user: row.user,
  };
}

function labelFromPayment(
  payment: RedemptionRow['payment'],
  names: PurchaseNameMaps,
): string | null {
  const cart = readCartCheckout(payment.metadata);
  const planId =
    readPackagePlanIdFromMetadata(payment.metadata) ??
    cart?.packagePlanId ??
    null;
  const sessionId =
    payment.source === 'DROPIN'
      ? (payment.sourceId ?? cart?.sessionId ?? null)
      : (cart?.sessionId ?? null);
  const packageFromUser =
    payment.source === 'PACKAGE' && payment.sourceId !== null
      ? (names.packages.get(payment.sourceId) ?? null)
      : null;
  const planName = planId ? (names.plans.get(planId) ?? null) : null;
  return couponPurchaseLabel({
    description: payment.description,
    packageName: packageFromUser ?? planName,
    className: sessionId ? (names.sessions.get(sessionId) ?? null) : null,
    barName: cart?.barProductId
      ? (names.bars.get(cart.barProductId) ?? null)
      : null,
  });
}
