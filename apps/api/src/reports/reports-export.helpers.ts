import { PaymentStatus } from '@prisma/client';
import {
  detectPaymentSource,
  localDateKey,
  readGiftAmount,
  toCsvRow,
} from './reports.helpers';

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
  }>,
) {
  return payments.reduce<
    Record<
      'package' | 'dropin' | 'gift' | 'other',
      { count: number; amountCents: number }
    >
  >(
    (acc, payment) => {
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
  }>,
) {
  const dailyRevenueMap = new Map<string, number>();
  for (const payment of payments) {
    if (payment.status !== PaymentStatus.SUCCEEDED) {
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

export function buildGiftCreditCsvRows(input: {
  issuedCards: Array<{
    code: string;
    createdAt: Date;
    amountCents?: number;
    amountAmd?: number;
    recipientEmail: string | null;
    recipientName: string | null;
    recipient: { email: string | null } | null;
    purchaser: {
      id: string;
      email: string;
      name: string | null;
      lastName: string | null;
    };
  }>;
  redeemedCards: Array<{
    code: string;
    updatedAt: Date;
    amountCents?: number;
    amountAmd?: number;
    recipient: {
      id: string;
      email: string;
      name: string | null;
      lastName: string | null;
    } | null;
  }>;
  spendPayments: Array<{
    id: string;
    userId: string;
    amountCents: number;
    currency: string;
    createdAt: Date;
    description: string | null;
    user: {
      email: string;
      name: string | null;
      lastName: string | null;
    };
  }>;
  currency: string;
}): string[] {
  const rows: string[] = [];
  for (const card of input.issuedCards) {
    rows.push(
      toCsvRow([
        'ISSUED',
        card.createdAt.toISOString(),
        card.purchaser.id,
        card.purchaser.email,
        formatPersonName(card.purchaser.name, card.purchaser.lastName),
        readGiftAmount(card),
        input.currency,
        card.code,
        card.recipientEmail ?? card.recipient?.email ?? card.recipientName ?? '',
      ]),
    );
  }
  for (const card of input.redeemedCards) {
    rows.push(
      toCsvRow([
        'REDEEMED',
        card.updatedAt.toISOString(),
        card.recipient?.id ?? '',
        card.recipient?.email ?? '',
        formatPersonName(card.recipient?.name, card.recipient?.lastName),
        readGiftAmount(card),
        input.currency,
        card.code,
        '',
      ]),
    );
  }
  for (const payment of input.spendPayments) {
    rows.push(
      toCsvRow([
        'SPENT',
        payment.createdAt.toISOString(),
        payment.userId,
        payment.user.email,
        formatPersonName(payment.user.name, payment.user.lastName),
        payment.amountCents,
        payment.currency,
        payment.id,
        payment.description ?? '',
      ]),
    );
  }
  return rows;
}
