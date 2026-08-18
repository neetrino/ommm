import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ManualPaymentMethod,
  PaymentSource,
  PaymentStatus,
  UserPackageStatus,
  type PackagePlan,
} from '@prisma/client';
import {
  PUBLIC_CACHE_KEYS,
  PUBLIC_CACHE_TTL_SEC,
} from '../cache/public-cache-keys';
import { RedisCacheService } from '../cache/redis-cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { ArcaService } from '../payments/arca/arca.service';
import { readArcaMetadata } from '../payments/arca/arca-metadata.util';
import { isArcaCheckoutEnabled } from '../payments/payment-arca.util';
import { buildPackagePaymentDescription } from '../payments/payments-related-item.util';
import { SubscribePackageDto } from './dto/subscribe-package.dto';
import { planCoversClassType } from './plan-covers-class-type';
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
import {
  buildUserPackageCreateData,
  createPendingCardPackagePurchase,
  failDuplicatePendingCardPurchases,
  failPendingCardPackagePurchase,
  findPendingCardPackagePurchase,
  type PendingCardPackagePurchase,
} from './packages-subscribe-card.util';
import { createBalancesForUserPackage } from './packages-user-package-balances.util';
import { toUserPackageFreezeApi } from './packages-freeze.mapper';
import { resumeDueFreezes } from './packages-freeze.resume';
import { resolveUserPackagePlan } from './user-package-plan-snapshot.util';
import {
  buildVisibleUserPackagesWhere,
  compareUserPackagesForClientList,
  loadSucceededPackageSourceIds,
} from './user-package-list.util';

@Injectable()
export class PackagesPublicService {
  private readonly logger = new Logger(PackagesPublicService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly cache: RedisCacheService,
    @Inject(forwardRef(() => ArcaService))
    private readonly arca: ArcaService,
  ) {}

  async listPlans() {
    return this.cache.getOrSet(
      PUBLIC_CACHE_KEYS.packages,
      PUBLIC_CACHE_TTL_SEC.packages,
      () => this.loadPublicPlansFromDb(),
    );
  }

  /**
   * Active purchase plans that cover the given class type
   * (dedicated or multi-type packages that include it).
   */
  async listPlansCoveringClassType(classTypeId: string) {
    const plans = await this.listPlans();
    return plans.filter((plan) => planCoversClassType(plan, classTypeId));
  }

  async invalidatePublicPlansCache(): Promise<void> {
    await this.cache.invalidate(PUBLIC_CACHE_KEYS.packages);
  }

  async listMine(userId: string) {
    await resumeDueFreezes(this.prisma, { userId });
    const succeededPackageIds = await loadSucceededPackageSourceIds(
      this.prisma,
      userId,
    );
    const rows = await this.prisma.userPackage.findMany({
      where: buildVisibleUserPackagesWhere(userId, succeededPackageIds),
      include: { plan: true },
      take: 200,
    });
    rows.sort(compareUserPackagesForClientList);
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
        freeze: toUserPackageFreezeApi(row, row.plan),
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

    const isCardPayment = dto.paymentMethod === ManualPaymentMethod.CARD;
    if (isCardPayment && isArcaCheckoutEnabled(this.config)) {
      return this.subscribeCardWithArca(userId, plan, dto.locale);
    }

    return this.subscribeWithoutArcaRedirect(userId, plan, isCardPayment);
  }

  private async subscribeCardWithArca(
    userId: string,
    plan: PackagePlan,
    locale?: string,
  ) {
    const resolved = await this.resolveCardPurchase(userId, plan);
    try {
      const { redirectUrl } = await this.arca.initPayment({
        userId,
        paymentReference: resolved.purchase.paymentReference,
        locale,
      });
      return {
        id: resolved.purchase.paymentId,
        paymentReference: resolved.purchase.paymentReference,
        requiresArcaCheckout: true,
        redirectUrl,
      };
    } catch (error) {
      await this.compensateFailedArcaInit(resolved);
      throw error;
    }
  }

  private async resolveCardPurchase(
    userId: string,
    plan: PackagePlan,
  ): Promise<{ purchase: PendingCardPackagePurchase; created: boolean }> {
    const resolved = await this.prisma.$transaction(async (tx) => {
      const existing = await findPendingCardPackagePurchase(
        tx,
        userId,
        plan.id,
      );
      if (existing !== null) {
        return { purchase: existing, created: false };
      }
      const purchase = await createPendingCardPackagePurchase(tx, {
        userId,
        plan,
      });
      return { purchase, created: true };
    });

    // Always keep the oldest pending for this plan; fail newer concurrent creates.
    let canonical = await findPendingCardPackagePurchase(
      this.prisma,
      userId,
      plan.id,
    );
    if (canonical === null) {
      canonical = await this.prisma.$transaction((tx) =>
        createPendingCardPackagePurchase(tx, { userId, plan }),
      );
      return { purchase: canonical, created: true };
    }
    await failDuplicatePendingCardPurchases(this.prisma, {
      userId,
      planId: plan.id,
      keepPaymentId: canonical.paymentId,
    });
    return {
      purchase: canonical,
      created:
        resolved.created && canonical.paymentId === resolved.purchase.paymentId,
    };
  }

  private async compensateFailedArcaInit(resolved: {
    purchase: PendingCardPackagePurchase;
    created: boolean;
  }): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: resolved.purchase.paymentId },
      select: { metadata: true },
    });
    const alreadyRegistered =
      readArcaMetadata(payment?.metadata ?? null).provider === 'arca';
    if (alreadyRegistered && !resolved.created) {
      this.logger.warn(
        `Arca re-init failed for payment ${resolved.purchase.paymentId}; keeping existing bank order`,
      );
      return;
    }
    await failPendingCardPackagePurchase(this.prisma, {
      paymentId: resolved.purchase.paymentId,
      userPackageId: resolved.purchase.userPackageId,
    });
    this.logger.warn(
      `Arca init failed for package payment ${resolved.purchase.paymentId}; marked FAILED`,
    );
  }

  private async subscribeWithoutArcaRedirect(
    userId: string,
    plan: PackagePlan,
    isCardPayment: boolean,
  ) {
    if (isCardPayment) {
      return this.subscribeCardWithoutArca(userId, plan);
    }
    return this.subscribeCashImmediate(userId, plan);
  }

  /** CARD without Arca: payment only; package created on admin/manual confirm. */
  private async subscribeCardWithoutArca(userId: string, plan: PackagePlan) {
    const purchase = await this.prisma.$transaction((tx) =>
      createPendingCardPackagePurchase(tx, { userId, plan }),
    );
    return {
      id: purchase.paymentId,
      paymentReference: purchase.paymentReference,
      requiresArcaCheckout: false,
    };
  }

  private async subscribeCashImmediate(userId: string, plan: PackagePlan) {
    const paymentReference = createPaymentReference('PACKAGE');
    const created = await this.prisma.$transaction(async (tx) => {
      const userPackage = await tx.userPackage.create({
        data: buildUserPackageCreateData({
          userId,
          plan,
          status: UserPackageStatus.ACTIVE,
        }),
      });
      await createBalancesForUserPackage(tx, {
        plan,
        userPackageId: userPackage.id,
      });
      await tx.payment.create({
        data: {
          userId,
          amountCents: resolveFinalPriceCents(plan),
          currency: plan.currency.toLowerCase(),
          status: PaymentStatus.SUCCEEDED,
          paymentReference,
          source: PaymentSource.PACKAGE,
          sourceId: userPackage.id,
          description: buildPackagePaymentDescription(plan.name),
          confirmedAt: new Date(),
          paymentMethod: ManualPaymentMethod.CASH,
        },
      });
      await decrementPackagePlanStock(tx, plan.id);
      return {
        userPackageId: userPackage.id,
        paymentReference,
        stockTracked: plan.availableQuantity !== null,
      };
    });

    if (created.stockTracked) {
      await this.invalidatePublicPlansCache();
    }

    return {
      id: created.userPackageId,
      paymentReference: created.paymentReference,
      requiresArcaCheckout: false,
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
