import { ManualPaymentMethod, PaymentStatus } from '@prisma/client';
import {
  buildDailyFinanceReport,
  DailyFinanceGroupRow,
} from './manager-daily-finance.aggregate';
import { ManagerDailyFinanceService } from './manager-daily-finance.service';

function row(
  status: PaymentStatus,
  paymentMethod: ManualPaymentMethod | null,
  count: number,
  amountCents: number | null,
): DailyFinanceGroupRow {
  return {
    status,
    paymentMethod,
    _count: { id: count },
    _sum: { amountCents },
  };
}

describe('buildDailyFinanceReport', () => {
  it('splits succeeded revenue by method and excludes influencer comps', () => {
    const report = buildDailyFinanceReport('2026-10-15', [
      row(PaymentStatus.SUCCEEDED, ManualPaymentMethod.CASH, 2, 30_000),
      row(PaymentStatus.SUCCEEDED, ManualPaymentMethod.CARD, 1, 15_000),
      row(PaymentStatus.SUCCEEDED, null, 1, 5_000),
      row(PaymentStatus.SUCCEEDED, ManualPaymentMethod.INFLUENCER, 3, 90_000),
      row(PaymentStatus.PENDING, ManualPaymentMethod.CASH, 1, 10_000),
      row(PaymentStatus.REFUNDED, ManualPaymentMethod.CARD, 1, 15_000),
      row(PaymentStatus.FAILED, ManualPaymentMethod.CARD, 4, 60_000),
    ]);

    expect(report.date).toBe('2026-10-15');
    expect(report.revenue).toEqual({ count: 4, amountCents: 50_000 });
    expect(report.pending).toEqual({ count: 1, amountCents: 10_000 });
    expect(report.refunded).toEqual({ count: 1, amountCents: 15_000 });
    expect(report.byMethod).toEqual([
      { method: ManualPaymentMethod.CASH, count: 2, amountCents: 30_000 },
      { method: ManualPaymentMethod.CARD_TERMINAL, count: 0, amountCents: 0 },
      { method: ManualPaymentMethod.CARD, count: 1, amountCents: 15_000 },
      { method: ManualPaymentMethod.BANK_TRANSFER, count: 0, amountCents: 0 },
      { method: ManualPaymentMethod.OTHER, count: 1, amountCents: 5_000 },
    ]);
  });

  it('returns zeroed buckets when there are no payments', () => {
    const report = buildDailyFinanceReport('2026-10-15', []);
    expect(report.revenue).toEqual({ count: 0, amountCents: 0 });
    expect(report.byMethod.every((bucket) => bucket.count === 0)).toBe(true);
  });
});

describe('ManagerDailyFinanceService', () => {
  it('queries only the current studio day (Asia/Yerevan)', async () => {
    const groupBy = jest.fn().mockResolvedValue([]);
    const service = new ManagerDailyFinanceService({
      payment: { groupBy },
    } as never);

    const report = await service.today(new Date('2026-10-14T21:30:00.000Z'));

    expect(report.date).toBe('2026-10-15');
    const where = groupBy.mock.calls[0][0].where;
    expect(where.createdAt.gte.toISOString()).toBe('2026-10-14T20:00:00.000Z');
    expect(where.createdAt.lte.toISOString()).toBe('2026-10-15T19:59:59.999Z');
  });
});
