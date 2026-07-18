import {
  ManualPaymentMethod,
  PaymentSource,
  PaymentStatus,
  UserPackageStatus,
  type PackagePlan,
  type Prisma,
} from '@prisma/client';
import { buildPackagePaymentDescription } from '../payments/payments-related-item.util';
import {
  createPaymentReference,
  resolveFinalPriceCents,
} from './packages-plan.helpers';
import { createBalancesForUserPackage } from './packages-user-package-balances.util';
import { buildUserPackagePlanSnapshot } from './user-package-plan-snapshot.util';
import { resolveUserPackagePeriodBounds } from './user-package-period.util';

export type PendingCardPackagePurchase = {
  userPackageId: string;
  paymentReference: string;
  paymentId: string;
};

type PaymentPackageDb = Pick<
  Prisma.TransactionClient,
  'userPackage' | 'payment'
>;

/** Finds the newest PENDING card purchase for this user+plan, if any. */
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
  if (pendingPackages.length === 0) {
    return null;
  }

  const payment = await db.payment.findFirst({
    where: {
      userId,
      source: PaymentSource.PACKAGE,
      sourceId: { in: pendingPackages.map((row) => row.id) },
      status: PaymentStatus.PENDING,
      paymentMethod: ManualPaymentMethod.CARD,
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true, paymentReference: true, sourceId: true },
  });

  if (
    payment === null ||
    payment.sourceId === null ||
    payment.paymentReference === null
  ) {
    return null;
  }

  return {
    userPackageId: payment.sourceId,
    paymentReference: payment.paymentReference,
    paymentId: payment.id,
  };
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
  if (pendingPackages.length === 0) {
    return 0;
  }

  const duplicates = await db.payment.findMany({
    where: {
      userId: params.userId,
      source: PaymentSource.PACKAGE,
      sourceId: { in: pendingPackages.map((row) => row.id) },
      status: PaymentStatus.PENDING,
      paymentMethod: ManualPaymentMethod.CARD,
      id: { not: params.keepPaymentId },
    },
    select: { id: true, sourceId: true },
  });

  for (const payment of duplicates) {
    await failPendingCardPackagePurchase(db, {
      paymentId: payment.id,
      userPackageId: payment.sourceId,
    });
  }
  return duplicates.length;
}

/** Creates a PENDING UserPackage + CARD Payment for Arca checkout. */
export async function createPendingCardPackagePurchase(
  tx: Prisma.TransactionClient,
  params: { userId: string; plan: PackagePlan },
): Promise<PendingCardPackagePurchase> {
  const paymentReference = createPaymentReference('PACKAGE');
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
      amountCents: resolveFinalPriceCents(params.plan),
      currency: params.plan.currency.toLowerCase(),
      status: PaymentStatus.PENDING,
      paymentReference,
      source: PaymentSource.PACKAGE,
      sourceId: userPackage.id,
      description: buildPackagePaymentDescription(params.plan.name),
      confirmedAt: null,
      paymentMethod: ManualPaymentMethod.CARD,
    },
  });
  return {
    userPackageId: userPackage.id,
    paymentReference: payment.paymentReference ?? paymentReference,
    paymentId: payment.id,
  };
}

/** Marks a just-created (or abandoned) card purchase as failed/cancelled. */
export async function failPendingCardPackagePurchase(
  db: PaymentPackageDb,
  params: { paymentId: string; userPackageId: string | null },
): Promise<void> {
  await db.payment.updateMany({
    where: { id: params.paymentId, status: PaymentStatus.PENDING },
    data: {
      status: PaymentStatus.FAILED,
      confirmedAt: new Date(),
      paymentMethod: ManualPaymentMethod.CARD,
    },
  });
  if (params.userPackageId === null) {
    return;
  }
  await db.userPackage.updateMany({
    where: {
      id: params.userPackageId,
      status: UserPackageStatus.PENDING,
    },
    data: { status: UserPackageStatus.CANCELLED },
  });
}

/** Shared UserPackage create payload for subscribe flows. */
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
    currentPeriodStart,
    currentPeriodEnd,
    sessionsTotal: sessions,
    sessionsRemaining: sessions,
  };
}
