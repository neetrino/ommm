import { ManualPaymentMethod, PaymentStatus } from '@prisma/client';
import { isInfluencerPaymentMethod } from '../payments/payment-revenue.util';
import { detectPaymentSource, localDateKey } from './reports.helpers';

export function formatPersonName(
  name: string | null | undefined,
  lastName: string | null | undefined,
): string {
  return `${name ?? ''} ${lastName ?? ''}`.trim();
}

export function aggregatePaymentsBySource(
  payments: Array<{
    amountCents: number;
    description: string | null;
    status: PaymentStatus;
    paymentMethod?: ManualPaymentMethod | null;
  }>,
) {
  return payments.reduce<
    Record<
      'package' | 'dropin' | 'gift' | 'other',
      { count: number; amountCents: number }
    >
  >(
    (acc, payment) => {
      if (isInfluencerPaymentMethod(payment.paymentMethod)) {
        return acc;
      }
      const source = detectPaymentSource(payment.description);
      acc[source].count += 1;
      if (payment.status === PaymentStatus.SUCCEEDED) {
        acc[source].amountCents += payment.amountCents;
      }
      return acc;
    },
    {
      package: { count: 0, amountCents: 0 },
      dropin: { count: 0, amountCents: 0 },
      gift: { count: 0, amountCents: 0 },
      other: { count: 0, amountCents: 0 },
    },
  );
}

export function buildDailyRevenueFromPayments(
  payments: Array<{
    amountCents: number;
    status: PaymentStatus;
    createdAt: Date;
    paymentMethod?: ManualPaymentMethod | null;
  }>,
) {
  const dailyRevenueMap = new Map<string, number>();
  for (const payment of payments) {
    if (
      payment.status !== PaymentStatus.SUCCEEDED ||
      isInfluencerPaymentMethod(payment.paymentMethod)
    ) {
      continue;
    }
    const day = localDateKey(payment.createdAt);
    dailyRevenueMap.set(
      day,
      (dailyRevenueMap.get(day) ?? 0) + payment.amountCents,
    );
  }
  return [...dailyRevenueMap.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, amountCents]) => ({ date, amountCents }));
}
