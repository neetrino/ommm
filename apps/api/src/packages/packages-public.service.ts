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
import { SubscribePackageDto } from './dto/subscribe-package.dto';
import { planCoversClassType } from './plan-covers-class-type';
import {
  resolveClassTypeNameMapForAllocations,
  resolveFinalPriceCents,
  toPublicPlan,
} from './packages-plan.helpers';
import {
  assertPackageHasAvailableStock,
  packageHasPublicStock,
} from './packages-stock.helpers';
import {
  peekSpendableGiftCreditsCents,
  resolveGiftCreditsApplication,
} from './package-gift-credits.util';
import {
  createCashPackageSubscriptionWithGiftCredits,
  createFullyGiftCoveredPackageSubscription,
  createPendingCardPurchaseWithGiftCredits,
  resolvePendingCardPackagePurchase,
} from './packages-subscribe-gift.util';
import {
  failPendingCardPackagePurchase,
  type PendingCardPackagePurchase,
} from './packages-subscribe-card.util';
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

    const useGiftCredits = dto.useGiftCredits === true;
    const isCardPayment = dto.paymentMethod === ManualPaymentMethod.CARD;
    if (isCardPayment && isArcaCheckoutEnabled(this.config)) {
      return this.subscribeCardWithArca(userId, plan, dto.locale, useGiftCredits);
    }
    return this.subscribeWithoutArcaRedirect(
      userId,
      plan,
      isCardPayment,
      useGiftCredits,
    );
  }

  private async subscribeCardWithArca(
    userId: string,
    plan: PackagePlan,
    locale: string | undefined,
    useGiftCredits: boolean,
  ) {
    const pricing = await this.resolveSubscribePricing(
      userId,
      plan,
      useGiftCredits,
    );
    if (pricing.chargeCents === 0) {
      return this.subscribeFullyCoveredByGiftCredits(
        userId,
        plan,
        pricing.appliedCents,
      );
    }

    const resolved = await resolvePendingCardPackagePurchase(this.prisma, {
      userId,
      plan,
      chargeCents: pricing.chargeCents,
      giftCreditsAppliedCents: pricing.appliedCents,
    });
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
        giftCreditsAppliedCents: pricing.appliedCents,
        amountDueCents: pricing.chargeCents,
      };
    } catch (error) {
      await this.compensateFailedArcaInit(resolved);
      throw error;
    }
  }

  private async resolveSubscribePricing(
    userId: string,
    plan: PackagePlan,
    useGiftCredits: boolean,
  ): Promise<{
    appliedCents: number;
    chargeCents: number;
    finalPriceCents: number;
  }> {
    const finalPriceCents = resolveFinalPriceCents(plan);
    if (!useGiftCredits) {
      return { appliedCents: 0, chargeCents: finalPriceCents, finalPriceCents };
    }
    const spendableCents = await peekSpendableGiftCreditsCents(
      this.prisma,
      userId,
    );
    return {
      ...resolveGiftCreditsApplication({
        useGiftCredits: true,
        spendableCents,
        finalPriceCents,
      }),
      finalPriceCents,
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
    useGiftCredits: boolean,
  ) {
    const pricing = await this.resolveSubscribePricing(
      userId,
      plan,
      useGiftCredits,
    );
    if (pricing.chargeCents === 0) {
      return this.subscribeFullyCoveredByGiftCredits(
        userId,
        plan,
        pricing.appliedCents,
      );
    }
    if (isCardPayment) {
      const purchase = await this.prisma.$transaction((tx) =>
        createPendingCardPurchaseWithGiftCredits(tx, {
          userId,
          plan,
          chargeCents: pricing.chargeCents,
          giftCreditsAppliedCents: pricing.appliedCents,
        }),
      );
      return {
        id: purchase.paymentId,
        paymentReference: purchase.paymentReference,
        requiresArcaCheckout: false,
        giftCreditsAppliedCents: pricing.appliedCents,
        amountDueCents: pricing.chargeCents,
      };
    }

    const created = await this.prisma.$transaction((tx) =>
      createCashPackageSubscriptionWithGiftCredits(tx, {
        userId,
        plan,
        giftCreditsAppliedCents: pricing.appliedCents,
      }),
    );
    if (created.stockTracked) {
      await this.invalidatePublicPlansCache();
    }
    return {
      id: created.userPackageId,
      paymentReference: created.paymentReference,
      requiresArcaCheckout: false,
      giftCreditsAppliedCents: pricing.appliedCents,
      amountDueCents: created.chargeCents,
    };
  }

  private async subscribeFullyCoveredByGiftCredits(
    userId: string,
    plan: PackagePlan,
    appliedCents: number,
  ) {
    const created = await this.prisma.$transaction((tx) =>
      createFullyGiftCoveredPackageSubscription(tx, {
        userId,
        plan,
        appliedCents,
      }),
    );
    if (created.stockTracked) {
      await this.invalidatePublicPlansCache();
    }
    return {
      id: created.userPackageId,
      paymentReference: created.paymentReference,
      requiresArcaCheckout: false,
      giftCreditsAppliedCents: appliedCents,
      amountDueCents: 0,
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
