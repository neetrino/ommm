import { PaymentStatus, type PaymentSource, type Prisma } from '@prisma/client';
import { readCouponSnapshot } from '../coupons/coupon-metadata.util';
import { releaseReservedCoupon } from '../coupons/coupon-redemption.util';
import { readGiftCreditsAppliedCents } from '../packages/package-gift-credits.metadata';
import type { PrismaService } from '../prisma/prisma.service';
import { mergeArcaMetadata, readArcaMetadata } from './arca/arca-metadata.util';
import { PAYMENT_STATUS_REASON } from './payment-status-reason';

type PendingDb = PrismaService | Prisma.TransactionClient;

export type PendingCheckoutRow = {
  payment: {
    id: string;
    amountCents: number;
    metadata: Prisma.JsonValue;
    paymentReference: string | null;
    status: PaymentStatus;
    userId: string;
    source: PaymentSource;
    sourceId: string | null;
    currency: string;
    description: string | null;
  };
  atBank: boolean;
};

/** True when this unpaid attempt is the same charge the user is submitting again. */
export function checkoutAttemptMatches(
  payment: { amountCents: number; metadata: Prisma.JsonValue | null },
  next: { chargeCents: number; appliedGiftCents: number; couponId: string | null },
): boolean {
  const couponId = readCouponSnapshot(payment.metadata)?.couponId ?? null;
  return (
    payment.amountCents === next.chargeCents &&
    readGiftCreditsAppliedCents(payment.metadata) === next.appliedGiftCents &&
    couponId === next.couponId
  );
}

/** Pending checkouts for one purchase target, oldest first. */
export async function listPendingCheckoutPayments(
  db: PendingDb,
  filter: {
    userId: string;
    source: PaymentSource;
    sourceId?: string | null;
    checkoutKind?: string;
  },
): Promise<PendingCheckoutRow[]> {
  const rows = await db.payment.findMany({
    where: {
      userId: filter.userId,
      source: filter.source,
      status: PaymentStatus.PENDING,
      ...(filter.sourceId !== undefined ? { sourceId: filter.sourceId } : {}),
      ...(filter.checkoutKind === undefined
        ? {}
        : { metadata: { path: ['checkoutKind'], equals: filter.checkoutKind } }),
    },
    orderBy: { createdAt: 'asc' },
    take: 20,
  });
  return rows.map((payment) => ({
    payment,
    atBank: readArcaMetadata(payment.metadata).provider === 'arca',
  }));
}

/** Ids of bankless pendings, optionally keeping the attempt that will be reused. */
export function unsentPaymentIds(
  rows: readonly PendingCheckoutRow[],
  keepId?: string,
): string[] {
  return rows
    .filter((row) => !row.atBank && row.payment.id !== keepId)
    .map((row) => row.payment.id);
}

/** Fails bankless pendings and releases their coupon reservation. Bank orders stay. */
export async function failUnsentPendingPayments(
  db: PendingDb,
  paymentIds: readonly string[],
): Promise<void> {
  for (const paymentId of paymentIds) {
    await failOneUnsentPending(db, paymentId);
  }
}

async function failOneUnsentPending(db: PendingDb, paymentId: string): Promise<void> {
  const existing = await db.payment.findUnique({
    where: { id: paymentId },
    select: { metadata: true, status: true },
  });
  if (existing === null || existing.status !== PaymentStatus.PENDING) {
    return;
  }
  if (readArcaMetadata(existing.metadata).provider === 'arca') {
    return;
  }
  await db.payment.update({
    where: { id: paymentId },
    data: {
      status: PaymentStatus.FAILED,
      confirmedAt: new Date(),
      metadata: mergeArcaMetadata(existing.metadata, {
        statusReason: PAYMENT_STATUS_REASON.DUPLICATE_ATTEMPT,
      }),
    },
  });
  await releaseReservedCoupon(db, paymentId);
}
