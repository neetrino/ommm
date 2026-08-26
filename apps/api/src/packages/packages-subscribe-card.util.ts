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
import {
  readPackagePlanIdFromMetadata,
  withPackagePlanIdMetadata,
} from './package-payment-metadata.util';
import {
  createPaymentReference,
  resolveFinalPriceCents,
} from './packages-plan.helpers';
import {
  PACKAGE_GIFT_CREDITS_APPLIED_KEY,
  readGiftCreditsAppliedCents,
  refundReservedGiftCredits,
} from './package-gift-credits.util';
import { buildUserPackagePlanSnapshot } from './user-package-plan-snapshot.util';
import { shouldAwaitFirstVisit } from './packages-activation.helpers';
import { resolveGuestSlotsFromPlan } from './packages-guest-pass.helpers';
import { resolveUserPackagePeriodBounds } from './user-package-period.util';

/**
 * Pending card checkout. `userPackageId` is null for the deferred-create flow
 * (package is created only after payment succeeds). Legacy in-flight checkouts
 * may still have a PENDING package id.
 */
export type PendingCardPackagePurchase = {
  userPackageId: string | null;
  paymentReference: string;
  paymentId: string;
  planId: string;
  amountCents: number;
  giftCreditsAppliedCents: number;
};

type PaymentPackageDb = Pick<
  Prisma.TransactionClient,
  'userPackage' | 'payment' | 'user'
>;

function paymentMatchesPlan(
  payment: { sourceId: string | null; metadata: Prisma.JsonValue | null },
  planId: string,
  pendingPackageIds: ReadonlySet<string>,
): boolean {
  const metadataPlanId = readPackagePlanIdFromMetadata(payment.metadata);
  if (metadataPlanId === planId) {
    return true;
  }
  return payment.sourceId !== null && pendingPackageIds.has(payment.sourceId);
}

/** Finds the oldest PENDING card purchase for this user+plan, if any. */
export async function findPendingCardPackagePurchase(
  db: PaymentPackageDb,
  userId: string,
  planId: string,
): Promise<PendingCardPackagePurchase | null> {
  const pendingPackages = await db.userPackage.findMany({
    where: { userId, planId, status: UserPackageStatus.PENDING },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
    take: 20,
  });
  const pendingPackageIds = new Set(pendingPackages.map((row) => row.id));

  const payments = await db.payment.findMany({
    where: {
      userId,
      source: PaymentSource.PACKAGE,
      status: PaymentStatus.PENDING,
      paymentMethod: ManualPaymentMethod.CARD,
    },
    orderBy: { createdAt: 'asc' },
    take: 50,
    select: {
      id: true,
      paymentReference: true,
      sourceId: true,
      metadata: true,
      amountCents: true,
    },
  });

  for (const payment of payments) {
    if (!paymentMatchesPlan(payment, planId, pendingPackageIds)) {
      continue;
    }
    if (payment.paymentReference === null) {
      continue;
    }
    return {
      userPackageId: payment.sourceId,
      paymentReference: payment.paymentReference,
      paymentId: payment.id,
      planId,
      amountCents: payment.amountCents,
      giftCreditsAppliedCents: readGiftCreditsAppliedCents(payment.metadata),
    };
  }
  return null;
}

/**
 * Fails duplicate PENDING card purchases for the same plan so repeated clicks
 * cannot leave unbounded orphans. Keeps `keepPaymentId` untouched.
 */
export async function failDuplicatePendingCardPurchases(
  db: PaymentPackageDb,
  params: {
    userId: string;
    planId: string;
    keepPaymentId: string;
  },
): Promise<number> {
  const pendingPackages = await db.userPackage.findMany({
    where: {
      userId: params.userId,
      planId: params.planId,
      status: UserPackageStatus.PENDING,
    },
    select: { id: true },
  });
  const pendingPackageIds = new Set(pendingPackages.map((row) => row.id));

  const payments = await db.payment.findMany({
    where: {
      userId: params.userId,
      source: PaymentSource.PACKAGE,
      status: PaymentStatus.PENDING,
      paymentMethod: ManualPaymentMethod.CARD,
      id: { not: params.keepPaymentId },
    },
    select: { id: true, sourceId: true, metadata: true },
  });

  let failed = 0;
  for (const payment of payments) {
    if (!paymentMatchesPlan(payment, params.planId, pendingPackageIds)) {
      continue;
    }
    await failPendingCardPackagePurchase(db, {
      paymentId: payment.id,
      userPackageId: payment.sourceId,
      statusReason: PAYMENT_STATUS_REASON.DUPLICATE_ATTEMPT,
    });
    failed += 1;
  }
  return failed;
}

/**
 * Creates a PENDING CARD Payment for Arca checkout.
 * UserPackage is created only after payment succeeds (see fulfillPackagePayment).
 */
export async function createPendingCardPackagePurchase(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    plan: PackagePlan;
    chargeCents?: number;
    giftCreditsAppliedCents?: number;
  },
): Promise<PendingCardPackagePurchase> {
  const paymentReference = createPaymentReference('PACKAGE');
  const giftCreditsAppliedCents = Math.max(
    0,
    params.giftCreditsAppliedCents ?? 0,
  );
  const amountCents = params.chargeCents ?? resolveFinalPriceCents(params.plan);
  const payment = await tx.payment.create({
    data: {
      userId: params.userId,
      amountCents,
      currency: params.plan.currency.toLowerCase(),
      status: PaymentStatus.PENDING,
      paymentReference,
      source: PaymentSource.PACKAGE,
      sourceId: null,
      description: buildPackagePaymentDescription(params.plan.name),
      confirmedAt: null,
      paymentMethod: ManualPaymentMethod.CARD,
      metadata: withPackagePlanIdMetadata(null, params.plan.id, {
        statusReason: PAYMENT_STATUS_REASON.CHECKOUT_NOT_STARTED,
        ...(giftCreditsAppliedCents > 0
          ? { [PACKAGE_GIFT_CREDITS_APPLIED_KEY]: giftCreditsAppliedCents }
          : {}),
      }),
    },
  });
  return {
    userPackageId: null,
    paymentReference: payment.paymentReference ?? paymentReference,
    paymentId: payment.id,
    planId: params.plan.id,
    amountCents,
    giftCreditsAppliedCents,
  };
}

/**
 * Marks a pending card purchase as failed.
 * Deletes a legacy PENDING UserPackage when present; deferred flow has none.
 */
export async function failPendingCardPackagePurchase(
  db: PaymentPackageDb,
  params: {
    paymentId: string;
    userPackageId: string | null;
    statusReason?: string;
  },
): Promise<void> {
  const existing = await db.payment.findUnique({
    where: { id: params.paymentId },
    select: { metadata: true, status: true, userId: true },
  });
  if (!existing || existing.status !== PaymentStatus.PENDING) {
    return;
  }

  const reservedGiftCredits = readGiftCreditsAppliedCents(existing.metadata);
  await db.payment.update({
    where: { id: params.paymentId },
    data: {
      status: PaymentStatus.FAILED,
      confirmedAt: new Date(),
      paymentMethod: ManualPaymentMethod.CARD,
      metadata: mergeArcaMetadata(existing.metadata, {
        statusReason:
          params.statusReason ?? PAYMENT_STATUS_REASON.REGISTER_FAILED,
      }),
    },
  });
  if (reservedGiftCredits > 0) {
    await refundReservedGiftCredits(db, {
      userId: existing.userId,
      appliedCents: reservedGiftCredits,
    });
  }
  if (params.userPackageId === null) {
    return;
  }
  // Legacy in-flight PENDING rows: remove instead of CANCELLED so they never
  // appear as "cancelled packages" in client history.
  await db.userPackage.deleteMany({
    where: {
      id: params.userPackageId,
      status: UserPackageStatus.PENDING,
    },
  });
}

/** Shared UserPackage create payload for subscribe / fulfill flows. */
export function buildUserPackageCreateData(params: {
  userId: string;
  plan: PackagePlan;
  status: UserPackageStatus;
}) {
  const now = new Date();
  const { currentPeriodStart, currentPeriodEnd } =
    resolveUserPackagePeriodBounds({
      planStartDate: params.plan.startDate,
      purchasedAt: now,
      periodDays: params.plan.periodDays,
    });
  const sessions = params.plan.isUnlimited
    ? null
    : (params.plan.sessionsPerMonth ?? 0);
  return {
    userId: params.userId,
    planId: params.plan.id,
    ...buildUserPackagePlanSnapshot(params.plan),
    status: params.status,
    awaitingFirstVisit:
      params.status === UserPackageStatus.ACTIVE &&
      shouldAwaitFirstVisit(params.plan.startDate, now),
    currentPeriodStart,
    currentPeriodEnd,
    sessionsTotal: sessions,
    sessionsRemaining: sessions,
    ...resolveGuestSlotsFromPlan(params.plan.guestCount),
  };
}
