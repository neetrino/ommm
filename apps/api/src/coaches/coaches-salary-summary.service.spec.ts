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
    const summary = await service.forProfile('coach-1', '2026-08');
    expect(summary.completedSessions).toBe(3);
    expect(summary.totalEarningsCents).toBe(24_000);
    expect(summary.pendingPayoutCents).toBe(24_000);
    expect(summary.paidOutCents).toBe(0);
    expect(summary.salaryPerClassAmd).toBe(0);
  });

  it('zeros unpaid after the month is marked paid while keeping history', async () => {
    const service = buildService(150_000, 150_000, 15);
    const summary = await service.forProfile('coach-1', '2026-08');
    expect(summary.pendingPayoutCents).toBe(0);
    expect(summary.paidOutCents).toBe(150_000);
    expect(summary.totalEarningsCents).toBe(150_000);
  });

  it('scopes aggregates to the requested salary month', async () => {
    const accrualAgg = jest.fn().mockResolvedValue({
      _sum: { amountAmd: 8_000 },
      _count: 1,
    });
    const payoutAgg = jest.fn().mockResolvedValue({
      _sum: { amountAmd: 0 },
    });
    const service = new CoachSalarySummaryService({
      coachSalaryAccrual: { aggregate: accrualAgg },
      coachSalaryPayout: { aggregate: payoutAgg },
    } as never);

    await service.forProfile('coach-1', '2026-08');

    const monthWhere = {
      coachProfileId: 'coach-1',
      periodYear: 2026,
      periodMonth: 8,
    };
    expect(accrualAgg).toHaveBeenCalledWith(
      expect.objectContaining({ where: monthWhere }),
    );
    expect(payoutAgg).toHaveBeenCalledWith(
      expect.objectContaining({ where: monthWhere }),
    );
  });
});
