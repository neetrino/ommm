import { BookingStatus, ClassSessionStatus } from '@prisma/client';
import { utcToStudioCalendarDate } from '../common/studio-timezone';

export type SalaryPeriod = {
  year: number;
  month: number;
};

export type CoachSalaryAccrualInput = {
  status: ClassSessionStatus;
  bookedParticipantCount: number;
  salaryPerClassAmd: number;
};

const SALARY_MONTH_PATTERN = /^\d{4}-\d{2}$/;

export function isRegisteredBookingStatus(status: BookingStatus): boolean {
  return status !== BookingStatus.CANCELLED;
}

export function shouldAccrueCoachSalary(
  input: CoachSalaryAccrualInput,
): boolean {
  return (
    input.status === ClassSessionStatus.FINISHED &&
    input.bookedParticipantCount > 0 &&
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
