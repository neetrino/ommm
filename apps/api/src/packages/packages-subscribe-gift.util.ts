import {
  ManualPaymentMethod,
  PaymentSource,
  PaymentStatus,
  UserPackageStatus,
  type PackagePlan,
  type Prisma,
} from '@prisma/client';
import { mergeArcaMetadata } from '../payments/arca/arca-metadata.util';
import { PAYMENT_STATUS_REASON } from '../payments/payment-status-reason';
import { buildPackagePaymentDescription } from '../payments/payments-related-item.util';
import { PrismaService } from '../prisma/prisma.service';
import {
  PACKAGE_GIFT_CREDITS_APPLIED_KEY,
  recordGiftCreditSpendPayment,
  reserveGiftCreditsForPackage,
} from './package-gift-credits.util';
import {
  createPaymentReference,
  resolveFinalPriceCents,
} from './packages-plan.helpers';
import { decrementPackagePlanStock } from './packages-stock.helpers';
import {
  buildUserPackageCreateData,
  createPendingCardPackagePurchase,
  failDuplicatePendingCardPurchases,
  failPendingCardPackagePurchase,
  findPendingCardPackagePurchase,
  type PendingCardPackagePurchase,
} from './packages-subscribe-card.util';
import { createBalancesForUserPackage } from './packages-user-package-balances.util';

type SubscribeGiftDb = Prisma.TransactionClient;

export async function createFullyGiftCoveredPackageSubscription(
  tx: SubscribeGiftDb,
  params: {
    userId: string;
    plan: PackagePlan;
    appliedCents: number;
  },
): Promise<{
  userPackageId: string;
  paymentReference: string;
  stockTracked: boolean;
}> {
  const paymentReference = createPaymentReference('PACKAGE');
  await reserveGiftCreditsForPackage(tx, {
    userId: params.userId,
    appliedCents: params.appliedCents,
  });
  const userPackage = await tx.userPackage.create({
    data: buildUserPackageCreateData({
      userId: params.userId,
      plan: params.plan,
      status: UserPackageStatus.ACTIVE,
    }),
  });
  await createBalancesForUserPackage(tx, {
    plan: params.plan,
    userPackageId: userPackage.id,
  });
  await tx.payment.create({
    data: {
      userId: params.userId,
      amountCents: 0,
      currency: params.plan.currency.toLowerCase(),
      status: PaymentStatus.SUCCEEDED,
      paymentReference,
      source: PaymentSource.PACKAGE,
      sourceId: userPackage.id,
      description: buildPackagePaymentDescription(params.plan.name),
      confirmedAt: new Date(),
      paymentMethod: ManualPaymentMethod.CARD,
    },
  });
  await recordGiftCreditSpendPayment(tx, {
    userId: params.userId,
    appliedCents: params.appliedCents,
    planName: params.plan.name,
    userPackageId: userPackage.id,
    currency: params.plan.currency,
  });
  await decrementPackagePlanStock(tx, params.plan.id);
  return {
    userPackageId: userPackage.id,
    paymentReference,
    stockTracked: params.plan.availableQuantity !== null,
  };
}

export async function createCashPackageSubscriptionWithGiftCredits(
  tx: SubscribeGiftDb,
  params: {
    userId: string;
    plan: PackagePlan;
    giftCreditsAppliedCents: number;
  },
): Promise<{
  userPackageId: string;
  paymentId: string;
  paymentReference: string;
  stockTracked: boolean;
  chargeCents: number;
}> {
  const paymentReference = createPaymentReference('PACKAGE');
  const chargeCents =
    resolveFinalPriceCents(params.plan) - params.giftCreditsAppliedCents;
  if (params.giftCreditsAppliedCents > 0) {
    await reserveGiftCreditsForPackage(tx, {
      userId: params.userId,
      appliedCents: params.giftCreditsAppliedCents,
    });
  }
  const userPackage = await tx.userPackage.create({
    data: buildUserPackageCreateData({
      userId: params.userId,
      plan: params.plan,
      status: UserPackageStatus.PENDING,
    }),
  });
  await createBalancesForUserPackage(tx, {
    plan: params.plan,
    userPackageId: userPackage.id,
  });
  const payment = await tx.payment.create({
    data: {
      userId: params.userId,
      amountCents: chargeCents,
      currency: params.plan.currency.toLowerCase(),
      status: PaymentStatus.PENDING,
      paymentReference,
      source: PaymentSource.PACKAGE,
      sourceId: userPackage.id,
      description: buildPackagePaymentDescription(params.plan.name),
      confirmedAt: null,
      paymentMethod: ManualPaymentMethod.CASH,
      metadata: mergeArcaMetadata(null, {
        statusReason: PAYMENT_STATUS_REASON.AWAITING_CASH,
        ...(params.giftCreditsAppliedCents > 0
          ? { [PACKAGE_GIFT_CREDITS_APPLIED_KEY]: params.giftCreditsAppliedCents }
          : {}),
      }),
    },
  });
  return {
    userPackageId: userPackage.id,
    paymentId: payment.id,
    paymentReference,
    stockTracked: false,
    chargeCents,
  };
}

export async function createPendingCardPurchaseWithGiftCredits(
  tx: SubscribeGiftDb,
  params: {
    userId: string;
    plan: PackagePlan;
    chargeCents: number;
    giftCreditsAppliedCents: number;
  },
) {
  if (params.giftCreditsAppliedCents > 0) {
    await reserveGiftCreditsForPackage(tx, {
      userId: params.userId,
      appliedCents: params.giftCreditsAppliedCents,
    });
  }
  return createPendingCardPackagePurchase(tx, {
    userId: params.userId,
    plan: params.plan,
    chargeCents: params.chargeCents,
    giftCreditsAppliedCents: params.giftCreditsAppliedCents,
  });
}

/** Reuses a matching PENDING card checkout or creates a new reserved one. */
export async function resolvePendingCardPackagePurchase(
  db: PrismaService,
  params: {
    userId: string;
    plan: PackagePlan;
    chargeCents: number;
    giftCreditsAppliedCents: number;
  },
): Promise<{ purchase: PendingCardPackagePurchase; created: boolean }> {
  const { userId, plan, chargeCents, giftCreditsAppliedCents } = params;
  const resolved = await db.$transaction(async (tx) => {
    const existing = await findPendingCardPackagePurchase(tx, userId, plan.id);
    if (
      existing !== null &&
      existing.amountCents === chargeCents &&
      existing.giftCreditsAppliedCents === giftCreditsAppliedCents
    ) {
      return { purchase: existing, created: false };
    }
    if (existing !== null) {
      await failPendingCardPackagePurchase(tx, {
        paymentId: existing.paymentId,
        userPackageId: existing.userPackageId,
      });
    }
    const purchase = await createPendingCardPurchaseWithGiftCredits(tx, {
      userId,
      plan,
      chargeCents,
      giftCreditsAppliedCents,
    });
    return { purchase, created: true };
  });

  let canonical = await findPendingCardPackagePurchase(db, userId, plan.id);
  if (
    canonical === null ||
    canonical.amountCents !== chargeCents ||
    canonical.giftCreditsAppliedCents !== giftCreditsAppliedCents
  ) {
    canonical = await db.$transaction(async (tx) => {
      const stale = await findPendingCardPackagePurchase(tx, userId, plan.id);
      if (stale !== null) {
        await failPendingCardPackagePurchase(tx, {
          paymentId: stale.paymentId,
          userPackageId: stale.userPackageId,
        });
      }
      return createPendingCardPurchaseWithGiftCredits(tx, {
        userId,
        plan,
        chargeCents,
        giftCreditsAppliedCents,
      });
    });
    return { purchase: canonical, created: true };
  }

  await failDuplicatePendingCardPurchases(db, {
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
