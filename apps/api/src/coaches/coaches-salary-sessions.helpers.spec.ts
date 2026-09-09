import { BookingStatus, ClassSessionStatus } from '@prisma/client';
import {
  mapSalarySessionRow,
  resolveSalarySessionReason,
  type CoachSalarySessionSourceRow,
} from './coaches-salary-sessions.helpers';

function buildSession(
  overrides: Partial<CoachSalarySessionSourceRow> = {},
): CoachSalarySessionSourceRow {
  return {
    id: 'session-1',
    startsAt: new Date('2026-08-10T10:00:00.000Z'),
    endsAt: new Date('2026-08-10T11:00:00.000Z'),
    status: ClassSessionStatus.FINISHED,
    classTypeId: 'class-type-1',
    classType: { id: 'class-type-1', name: 'Pilates' },
    salaryAccrual: null,
    bookings: [],
    ...overrides,
  };
}

describe('resolveSalarySessionReason', () => {
  it('reports PAID when an accrual amount exists', () => {
    expect(
      resolveSalarySessionReason({
        status: ClassSessionStatus.FINISHED,
        amountAmd: 8000,
        rateAmd: 8000,
        registeredCount: 1,
        attendedCount: 1,
      }),
    ).toBe('PAID');
  });

  it('reports SESSION_CANCELLED for cancelled sessions', () => {
    expect(
      resolveSalarySessionReason({
        status: ClassSessionStatus.CANCELLED,
        amountAmd: 0,
        rateAmd: 8000,
        registeredCount: 3,
        attendedCount: 0,
      }),
    ).toBe('SESSION_CANCELLED');
  });

  it('reports NOT_FINISHED_YET for upcoming/active sessions', () => {
    expect(
      resolveSalarySessionReason({
        status: ClassSessionStatus.ACTIVE,
        amountAmd: 0,
        rateAmd: 8000,
        registeredCount: 2,
        attendedCount: 0,
      }),
    ).toBe('NOT_FINISHED_YET');
  });

  it('reports NO_RATE_CONFIGURED when there is no coach×classType rate', () => {
    expect(
      resolveSalarySessionReason({
        status: ClassSessionStatus.FINISHED,
        amountAmd: 0,
        rateAmd: 0,
        registeredCount: 2,
        attendedCount: 1,
      }),
    ).toBe('NO_RATE_CONFIGURED');
  });

  it('reports NO_BOOKINGS when nobody registered at all', () => {
    expect(
      resolveSalarySessionReason({
        status: ClassSessionStatus.FINISHED,
        amountAmd: 0,
        rateAmd: 8000,
        registeredCount: 0,
        attendedCount: 0,
      }),
    ).toBe('NO_BOOKINGS');
  });

  it('reports NO_SHOW_ONLY when people booked but nobody attended', () => {
    expect(
      resolveSalarySessionReason({
        status: ClassSessionStatus.FINISHED,
        amountAmd: 0,
        rateAmd: 8000,
        registeredCount: 2,
        attendedCount: 0,
      }),
    ).toBe('NO_SHOW_ONLY');
  });

  it('reports PENDING_ACCRUAL when attendance + rate exist but accrual has not run yet', () => {
    expect(
      resolveSalarySessionReason({
        status: ClassSessionStatus.FINISHED,
        amountAmd: 0,
        rateAmd: 8000,
        registeredCount: 1,
        attendedCount: 1,
      }),
    ).toBe('PENDING_ACCRUAL');
  });
});

describe('mapSalarySessionRow', () => {
  it('counts registered, attended, and no-show bookings separately', () => {
    const session = buildSession({
      salaryAccrual: { amountAmd: 8000 },
      bookings: [
        { status: BookingStatus.COMPLETED },
        { status: BookingStatus.MISSED },
        { status: BookingStatus.MISSED },
      ],
    });

    const row = mapSalarySessionRow(session, 8000);

    expect(row.registeredCount).toBe(3);
    expect(row.attendedCount).toBe(1);
    expect(row.noShowCount).toBe(2);
    expect(row.amountAmd).toBe(8000);
    expect(row.reason).toBe('PAID');
  });

  it('flags a class with only no-shows as NO_SHOW_ONLY and zero pay', () => {
    const session = buildSession({
      bookings: [{ status: BookingStatus.MISSED }],
    });

    const row = mapSalarySessionRow(session, 8000);

    expect(row.attendedCount).toBe(0);
    expect(row.amountAmd).toBe(0);
    expect(row.reason).toBe('NO_SHOW_ONLY');
  });
});
