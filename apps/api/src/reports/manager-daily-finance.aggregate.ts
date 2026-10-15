import { ManualPaymentMethod, PaymentStatus } from '@prisma/client';
import { isInfluencerPaymentMethod } from '../payments/payment-revenue.util';

/** Methods shown in the daily report, in display order. Influencer comps are not revenue. */
export const DAILY_FINANCE_METHODS = [
  ManualPaymentMethod.CASH,
  ManualPaymentMethod.CARD_TERMINAL,
  ManualPaymentMethod.CARD,
  ManualPaymentMethod.BANK_TRANSFER,
  ManualPaymentMethod.OTHER,
] as const;

export type DailyFinanceMethod = (typeof DAILY_FINANCE_METHODS)[number];

export type DailyFinanceBucket = {
  count: number;
  amountCents: number;
};

export type DailyFinanceMethodBucket = DailyFinanceBucket & {
  method: DailyFinanceMethod;
};

/** Today-only finance snapshot exposed to Manager — no per-payment rows. */
export type DailyFinanceReport = {
  /** Studio calendar day `YYYY-MM-DD`. */
  date: string;
  revenue: DailyFinanceBucket;
  pending: DailyFinanceBucket;
  refunded: DailyFinanceBucket;
  byMethod: DailyFinanceMethodBucket[];
};

export type DailyFinanceGroupRow = {
  status: PaymentStatus;
  paymentMethod: ManualPaymentMethod | null;
  _count: { id: number };
  _sum: { amountCents: number | null };
};

function emptyBucket(): DailyFinanceBucket {
  return { count: 0, amountCents: 0 };
}

function addToBucket(
  bucket: DailyFinanceBucket,
  row: DailyFinanceGroupRow,
): void {
  bucket.count += row._count.id;
  bucket.amountCents += row._sum.amountCents ?? 0;
}

function toDailyMethod(method: ManualPaymentMethod | null): DailyFinanceMethod {
  const known = DAILY_FINANCE_METHODS.find((candidate) => candidate === method);
  return known ?? ManualPaymentMethod.OTHER;
}

/** Folds `payment.groupBy([status, paymentMethod])` rows into the daily report shape. */
export function buildDailyFinanceReport(
  date: string,
  rows: readonly DailyFinanceGroupRow[],
): DailyFinanceReport {
  const revenue = emptyBucket();
  const pending = emptyBucket();
  const refunded = emptyBucket();
  const methodBuckets = new Map<DailyFinanceMethod, DailyFinanceBucket>(
    DAILY_FINANCE_METHODS.map((method) => [method, emptyBucket()]),
  );

  for (const row of rows) {
    if (isInfluencerPaymentMethod(row.paymentMethod)) {
      continue;
    }
    if (row.status === PaymentStatus.PENDING) {
      addToBucket(pending, row);
    } else if (row.status === PaymentStatus.REFUNDED) {
      addToBucket(refunded, row);
    } else if (row.status === PaymentStatus.SUCCEEDED) {
      addToBucket(revenue, row);
      const methodBucket = methodBuckets.get(toDailyMethod(row.paymentMethod));
      if (methodBucket) {
        addToBucket(methodBucket, row);
      }
    }
  }

  return {
    date,
    revenue,
    pending,
    refunded,
    byMethod: DAILY_FINANCE_METHODS.map((method) => ({
      method,
      ...(methodBuckets.get(method) ?? emptyBucket()),
    })),
  };
}
