import { BookingStatus, ClassSessionStatus } from '@prisma/client';
import {
  isRegisteredBookingStatus,
  parseSalaryMonthParam,
  salaryPeriodFromInstant,
  shouldAccrueCoachSalary,
  unpaidSalaryAmd,
} from './coaches-salary.helpers';

describe('coaches-salary.helpers', () => {
  it('accrues only FINISHED classes with at least one registered participant and a rate', () => {
    expect(
      shouldAccrueCoachSalary({
        status: ClassSessionStatus.FINISHED,
        bookedParticipantCount: 1,
        salaryPerClassAmd: 8000,
      }),
    ).toBe(true);
  });

  it('does not accrue cancelled classes', () => {
    expect(
      shouldAccrueCoachSalary({
        status: ClassSessionStatus.CANCELLED,
        bookedParticipantCount: 3,
        salaryPerClassAmd: 8000,
      }),
    ).toBe(false);
  });

  it('does not accrue finished classes with zero registered participants', () => {
    expect(
      shouldAccrueCoachSalary({
        status: ClassSessionStatus.FINISHED,
        bookedParticipantCount: 0,
        salaryPerClassAmd: 8000,
      }),
    ).toBe(false);
  });

  it('does not accrue when salary per class is zero', () => {
    expect(
      shouldAccrueCoachSalary({
        status: ClassSessionStatus.FINISHED,
        bookedParticipantCount: 2,
        salaryPerClassAmd: 0,
      }),
    ).toBe(false);
  });

  it('treats missed and completed bookings as registered, cancelled as not', () => {
    expect(isRegisteredBookingStatus(BookingStatus.BOOKED)).toBe(true);
    expect(isRegisteredBookingStatus(BookingStatus.COMPLETED)).toBe(true);
    expect(isRegisteredBookingStatus(BookingStatus.MISSED)).toBe(true);
    expect(isRegisteredBookingStatus(BookingStatus.CANCELLED)).toBe(false);
  });

  it('parses an explicit salary month and zeros unpaid after payout', () => {
    expect(parseSalaryMonthParam('2026-08')).toEqual({ year: 2026, month: 8 });
    expect(unpaidSalaryAmd(150_000, 150_000)).toBe(0);
    expect(unpaidSalaryAmd(150_000, 0)).toBe(150_000);
  });

  it('maps a studio instant onto its salary period', () => {
    expect(salaryPeriodFromInstant(new Date('2026-08-22T12:00:00.000Z'))).toEqual(
      { year: 2026, month: 8 },
    );
  });
});
