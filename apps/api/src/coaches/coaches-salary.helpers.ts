import { BookingStatus, ClassSessionStatus } from '@prisma/client';
import { utcToStudioCalendarDate } from '../common/studio-timezone';

export type SalaryPeriod = {
  year: number;
  month: number;
};

export type CoachSalaryAccrualInput = {
  status: ClassSessionStatus;
  /** Bookings that actually resulted in attendance (COMPLETED), not just a reservation. */
  attendedParticipantCount: number;
  salaryPerClassAmd: number;
};

const SALARY_MONTH_PATTERN = /^\d{4}-\d{2}$/;

/**
 * A booking only counts as attendance when the client actually showed up.
 * `MISSED` (no-show) and a still-open `BOOKED` reservation must NOT trigger pay —
 * the coach is only paid for classes that had at least one real participant.
 */
export function isAttendedBookingStatus(status: BookingStatus): boolean {
  return status === BookingStatus.COMPLETED;
}

export function shouldAccrueCoachSalary(
  input: CoachSalaryAccrualInput,
): boolean {
  return (
    input.status === ClassSessionStatus.FINISHED &&
    input.attendedParticipantCount > 0 &&
    input.salaryPerClassAmd > 0
  );
}

export function salaryPeriodFromInstant(value: Date): SalaryPeriod {
  return salaryPeriodFromCalendarDate(utcToStudioCalendarDate(value));
}

export function parseSalaryMonthParam(month?: string): SalaryPeriod {
  if (month && SALARY_MONTH_PATTERN.test(month)) {
    return salaryPeriodFromCalendarDate(`${month}-01`);
  }
  return salaryPeriodFromInstant(new Date());
}

export function unpaidSalaryAmd(accruedAmd: number, paidAmd: number): number {
  return Math.max(0, accruedAmd - paidAmd);
}

function salaryPeriodFromCalendarDate(calendarDate: string): SalaryPeriod {
  return {
    year: Number.parseInt(calendarDate.slice(0, 4), 10),
    month: Number.parseInt(calendarDate.slice(5, 7), 10),
  };
}
