import { CoachSalarySummaryService } from './coaches-salary-summary.service';

describe('CoachSalarySummaryService', () => {
  function buildService(accrued: number, paid: number, count: number) {
    return new CoachSalarySummaryService({
      coachSalaryAccrual: {
        aggregate: jest.fn().mockResolvedValue({
          _sum: { amountAmd: accrued },
          _count: count,
        }),
      },
      coachSalaryPayout: {
        aggregate: jest.fn().mockResolvedValue({
          _sum: { amountAmd: paid },
        }),
      },
    } as never);
  }

  it('accumulates completed classes into unpaid salary for the month', async () => {
    const service = buildService(24_000, 0, 3);
    const summary = await service.forProfile('coach-1', 8000, '2026-08');
    expect(summary.completedSessions).toBe(3);
    expect(summary.totalEarningsCents).toBe(24_000);
    expect(summary.pendingPayoutCents).toBe(24_000);
    expect(summary.paidOutCents).toBe(0);
    expect(summary.salaryPerClassAmd).toBe(8000);
  });

  it('zeros unpaid after the month is marked paid while keeping history', async () => {
    const service = buildService(150_000, 150_000, 15);
    const summary = await service.forProfile('coach-1', 10_000, '2026-08');
    expect(summary.pendingPayoutCents).toBe(0);
    expect(summary.paidOutCents).toBe(150_000);
    expect(summary.totalEarningsCents).toBe(150_000);
  });
});
