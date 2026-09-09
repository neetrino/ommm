import { BookingStatus, ClassSessionStatus } from '@prisma/client';
import {
  isAttendedBookingStatus,
  parseSalaryMonthParam,
  salaryPeriodFromInstant,
  shouldAccrueCoachSalary,
  unpaidSalaryAmd,
} from './coaches-salary.helpers';

describe('coaches-salary.helpers', () => {
  it('accrues only FINISHED classes with at least one attended participant and a rate', () => {
    expect(
      shouldAccrueCoachSalary({
        status: ClassSessionStatus.FINISHED,
        attendedParticipantCount: 1,
        salaryPerClassAmd: 8000,
      }),
    ).toBe(true);
  });

  it('does not accrue cancelled classes', () => {
    expect(
      shouldAccrueCoachSalary({
        status: ClassSessionStatus.CANCELLED,
        attendedParticipantCount: 3,
        salaryPerClassAmd: 8000,
      }),
    ).toBe(false);
  });

  it('does not accrue finished classes with zero attended participants', () => {
    // Covers both "nobody booked" and "everyone booked but no-showed"
    // (BookingStatus.MISSED) — either way the coach did no work, no salary.
    expect(
      shouldAccrueCoachSalary({
        status: ClassSessionStatus.FINISHED,
        attendedParticipantCount: 0,
        salaryPerClassAmd: 8000,
      }),
    ).toBe(false);
  });

  it('does not accrue when salary per class is zero', () => {
    expect(
      shouldAccrueCoachSalary({
        status: ClassSessionStatus.FINISHED,
        attendedParticipantCount: 2,
        salaryPerClassAmd: 0,
      }),
    ).toBe(false);
  });

  it('only treats COMPLETED bookings as attendance — booked/missed/cancelled do not count', () => {
    expect(isAttendedBookingStatus(BookingStatus.BOOKED)).toBe(false);
    expect(isAttendedBookingStatus(BookingStatus.COMPLETED)).toBe(true);
    expect(isAttendedBookingStatus(BookingStatus.MISSED)).toBe(false);
    expect(isAttendedBookingStatus(BookingStatus.CANCELLED)).toBe(false);
  });

  it('parses an explicit salary month and zeros unpaid after payout', () => {
    expect(parseSalaryMonthParam('2026-08')).toEqual({ year: 2026, month: 8 });
    expect(unpaidSalaryAmd(150_000, 150_000)).toBe(0);
    expect(unpaidSalaryAmd(150_000, 0)).toBe(150_000);
  });

  it('does not accrue ACTIVE or FULL classes even with participants', () => {
    expect(
      shouldAccrueCoachSalary({
        status: ClassSessionStatus.ACTIVE,
        attendedParticipantCount: 4,
        salaryPerClassAmd: 8000,
      }),
    ).toBe(false);
    expect(
      shouldAccrueCoachSalary({
        status: ClassSessionStatus.FULL,
        attendedParticipantCount: 4,
        salaryPerClassAmd: 8000,
      }),
    ).toBe(false);
  });

  it('FINISHED is not enough by itself — participants and rate are also required', () => {
    expect(
      shouldAccrueCoachSalary({
        status: ClassSessionStatus.FINISHED,
        attendedParticipantCount: 0,
        salaryPerClassAmd: 12_000,
      }),
    ).toBe(false);
  });

  it('maps a studio instant onto its salary period', () => {
    expect(
      salaryPeriodFromInstant(new Date('2026-08-22T12:00:00.000Z')),
    ).toEqual({ year: 2026, month: 8 });
  });
});
