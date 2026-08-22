import { ClassSessionStatus } from '@prisma/client';
import { CoachSalaryAccrualService } from './coaches-salary-accrual.service';
import { CoachSalaryPayoutService } from './coaches-salary-payout.service';
import { CoachSalarySummaryService } from './coaches-salary-summary.service';
import {
  shouldAccrueCoachSalary,
  unpaidSalaryAmd,
} from './coaches-salary.helpers';

/**
 * End-to-end logic of the product rules, using the same helpers/services
 * the API uses — without a live database.
 */
describe('coach salary product scenario', () => {
  const salaryPerClassAmd = 8000;

  it('August classes: accrue only finished classes with participants', () => {
    const augustClasses = [
      {
        status: ClassSessionStatus.FINISHED,
        bookedParticipantCount: 3,
        label: 'completed with students',
      },
      {
        status: ClassSessionStatus.FINISHED,
        bookedParticipantCount: 0,
        label: 'completed empty class',
      },
      {
        status: ClassSessionStatus.CANCELLED,
        bookedParticipantCount: 4,
        label: 'cancelled with students',
      },
      {
        status: ClassSessionStatus.FINISHED,
        bookedParticipantCount: 1,
        label: 'second completed class',
      },
    ] as const;

    const accruedClasses = augustClasses.filter((session) =>
      shouldAccrueCoachSalary({
        status: session.status,
        bookedParticipantCount: session.bookedParticipantCount,
        salaryPerClassAmd,
      }),
    );

    expect(accruedClasses.map((session) => session.label)).toEqual([
      'completed with students',
      'second completed class',
    ]);
    expect(accruedClasses.length * salaryPerClassAmd).toBe(16_000);
  });

  it('Admin PAID zeros August unpaid and keeps the 16_000 payment in history', async () => {
    const months: Record<
      string,
      { accrued: number; paid: number; count: number }
    > = {
      '2026-08': { accrued: 16_000, paid: 0, count: 2 },
      '2026-09': { accrued: 0, paid: 0, count: 0 },
    };

    const summary = new CoachSalarySummaryService({
      coachSalaryAccrual: {
        aggregate: jest.fn(({ where }: { where: { periodMonth: number } }) => {
          const key = where.periodMonth === 8 ? '2026-08' : '2026-09';
          return {
            _sum: { amountAmd: months[key]?.accrued ?? 0 },
            _count: months[key]?.count ?? 0,
          };
        }),
      },
      coachSalaryPayout: {
        aggregate: jest.fn(({ where }: { where: { periodMonth: number } }) => {
          const key = where.periodMonth === 8 ? '2026-08' : '2026-09';
          return { _sum: { amountAmd: months[key]?.paid ?? 0 } };
        }),
      },
    } as never);

    const beforePay = await summary.forProfile(
      'coach-1',
      salaryPerClassAmd,
      '2026-08',
    );
    expect(beforePay.pendingPayoutCents).toBe(16_000);

    months['2026-08'].paid = 16_000;
    const afterPay = await summary.forProfile(
      'coach-1',
      salaryPerClassAmd,
      '2026-08',
    );
    expect(afterPay.pendingPayoutCents).toBe(0);
    expect(afterPay.paidOutCents).toBe(16_000);

    months['2026-09'].accrued = 8000;
    months['2026-09'].count = 1;
    const september = await summary.forProfile(
      'coach-1',
      salaryPerClassAmd,
      '2026-09',
    );
    expect(september.pendingPayoutCents).toBe(8000);
    expect(afterPay.paidOutCents).toBe(16_000);
  });

  it('writes a payout history row for the unpaid August amount', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'payout-aug' });
    const payout = new CoachSalaryPayoutService(
      {
        coachProfile: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'coach-1',
            salaryPerClassAmd,
          }),
        },
        coachSalaryPayout: { create },
      } as never,
      { log: jest.fn() } as never,
      {
        forProfile: jest
          .fn()
          .mockResolvedValueOnce({
            pendingPayoutCents: 16_000,
            salaryPerClassAmd,
          })
          .mockResolvedValueOnce({
            pendingPayoutCents: 0,
            paidOutCents: 16_000,
            salaryPerClassAmd,
          }),
      } as never,
    );

    const result = await payout.markMonthPaid(
      { id: 'admin-1', role: 'ADMIN' } as never,
      'coach-1',
      '2026-08',
    );

    expect(create).toHaveBeenCalledTimes(1);
    const [[createCall]] = create.mock.calls as [
      [
        {
          data: {
            amountAmd: number;
            periodYear: number;
            periodMonth: number;
          };
        },
      ],
    ];
    expect(createCall.data).toMatchObject({
      amountAmd: 16_000,
      periodYear: 2026,
      periodMonth: 8,
    });
    expect(result.pendingPayoutCents).toBe(0);
    expect(unpaidSalaryAmd(16_000, 16_000)).toBe(0);
  });

  it('does not create a salary transaction for an empty finished class', async () => {
    const create = jest.fn();
    const accrual = new CoachSalaryAccrualService({
      classSession: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'empty-class',
          status: ClassSessionStatus.FINISHED,
          startsAt: new Date('2026-08-10T10:00:00.000Z'),
          coachId: 'coach-1',
          coach: { salaryPerClassAmd },
          salaryAccrual: null,
          _count: { bookings: 0 },
        }),
      },
      coachSalaryAccrual: { create },
    } as never);

    await expect(accrual.accrueFinishedSession('empty-class')).resolves.toBe(
      false,
    );
    expect(create).not.toHaveBeenCalled();
  });
});
