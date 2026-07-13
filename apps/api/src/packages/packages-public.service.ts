import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ManualPaymentMethod,
  PaymentSource,
  PaymentStatus,
} from '@prisma/client';
import {
  PUBLIC_CACHE_KEYS,
  PUBLIC_CACHE_TTL_SEC,
} from '../cache/public-cache-keys';
import { RedisCacheService } from '../cache/redis-cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { isArcaCheckoutEnabled } from '../payments/payment-arca.util';
import { buildPackagePaymentDescription } from '../payments/payments-related-item.util';
import { SubscribePackageDto } from './dto/subscribe-package.dto';
import {
  createPaymentReference,
  resolveClassTypeNameMapForAllocations,
  resolveFinalPriceCents,
  toPublicPlan,
} from './packages-plan.helpers';
import {
  assertPackageHasAvailableStock,
  decrementPackagePlanStock,
  packageHasPublicStock,
} from './packages-stock.helpers';
import { USER_PACKAGE_STATUS } from './packages-plan.types';
import { createBalancesForUserPackage } from './packages-user-package-balances.util';
import {
  buildUserPackagePlanSnapshot,
  resolveUserPackagePlan,
} from './user-package-plan-snapshot.util';
import { resolveUserPackagePeriodBounds } from './user-package-period.util';

@Injectable()
export class PackagesPublicService {
  constructor(
    private readonly prisma: PrismaService,
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

  async invalidatePublicPlansCache(): Promise<void> {
    await this.cache.invalidate(PUBLIC_CACHE_KEYS.packages);
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
    if (
      plan === null ||
      !plan.isActive ||
      plan.priceCents <= 0 ||
      !packageHasPublicStock(plan)
    ) {
      throw new NotFoundException('Package plan not found');
    }
    assertPackageHasAvailableStock(plan);
    const now = new Date();
    const { currentPeriodStart, currentPeriodEnd } =
      resolveUserPackagePeriodBounds({
        planStartDate: plan.startDate,
        purchasedAt: now,
        periodDays: plan.periodDays,
      });
    const paymentReference = createPaymentReference('PACKAGE');
    const isCardPayment = dto.paymentMethod === ManualPaymentMethod.CARD;

    const created = await this.prisma.$transaction(async (tx) => {
      const userPackage = await tx.userPackage.create({
        data: {
          userId,
          planId: plan.id,
          ...buildUserPackagePlanSnapshot(plan),
          status: isCardPayment
            ? USER_PACKAGE_STATUS.PENDING
            : USER_PACKAGE_STATUS.ACTIVE,
          currentPeriodStart,
          currentPeriodEnd,
          sessionsTotal: plan.isUnlimited ? null : (plan.sessionsPerMonth ?? 0),
          sessionsRemaining: plan.isUnlimited
            ? null
            : (plan.sessionsPerMonth ?? 0),
        },
      });
      await createBalancesForUserPackage(tx, {
        plan,
        userPackageId: userPackage.id,
      });
      const payment = await tx.payment.create({
        data: {
          userId,
          amountCents: resolveFinalPriceCents(plan),
          currency: plan.currency.toLowerCase(),
          status: isCardPayment
            ? PaymentStatus.PENDING
            : PaymentStatus.SUCCEEDED,
          paymentReference,
          source: PaymentSource.PACKAGE,
          sourceId: userPackage.id,
          description: buildPackagePaymentDescription(plan.name),
          confirmedAt: isCardPayment ? null : new Date(),
          paymentMethod: dto.paymentMethod,
        },
      });
      if (!isCardPayment) {
        await decrementPackagePlanStock(tx, plan.id);
      }
      return {
        userPackageId: userPackage.id,
        paymentReference: payment.paymentReference,
        stockTracked: !isCardPayment && plan.availableQuantity !== null,
      };
    });

    if (created.stockTracked) {
      await this.invalidatePublicPlansCache();
    }

    return {
      id: created.userPackageId,
      paymentReference: created.paymentReference,
      requiresArcaCheckout: isCardPayment && isArcaCheckoutEnabled(this.config),
    };
  }

  private async loadPublicPlansFromDb() {
    const plans = await this.prisma.packagePlan.findMany({
      where: {
        isActive: true,
        priceCents: { gt: 0 },
        OR: [{ availableQuantity: null }, { availableQuantity: { gt: 0 } }],
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
    const classTypeNameById = await resolveClassTypeNameMapForAllocations(
      this.prisma,
      plans,
    );
    return plans.map((plan) => toPublicPlan(plan, classTypeNameById));
  }
}
