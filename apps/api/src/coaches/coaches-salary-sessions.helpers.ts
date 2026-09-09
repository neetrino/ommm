import { BookingStatus, ClassSessionStatus } from '@prisma/client';

/**
 * Explains why a session did or didn't contribute to the coach's salary —
 * shown in the admin salary breakdown so payroll is auditable line by line.
 */
export const COACH_SALARY_SESSION_REASONS = [
  'PAID',
  'NOT_FINISHED_YET',
  'SESSION_CANCELLED',
  'NO_RATE_CONFIGURED',
  'NO_BOOKINGS',
  'NO_SHOW_ONLY',
  'PENDING_ACCRUAL',
] as const;

export type CoachSalarySessionReason =
  (typeof COACH_SALARY_SESSION_REASONS)[number];

export type CoachSalarySessionSourceRow = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  status: ClassSessionStatus;
  classTypeId: string;
  classType: { id: string; name: string };
  salaryAccrual: { amountAmd: number } | null;
  bookings: { status: BookingStatus }[];
};

export type CoachSalarySessionRow = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  status: ClassSessionStatus;
  classType: { id: string; name: string };
  registeredCount: number;
  attendedCount: number;
  noShowCount: number;
  rateAmd: number;
  amountAmd: number;
  reason: CoachSalarySessionReason;
};

export function resolveSalarySessionReason(input: {
  status: ClassSessionStatus;
  amountAmd: number;
  rateAmd: number;
  registeredCount: number;
  attendedCount: number;
}): CoachSalarySessionReason {
  if (input.amountAmd > 0) {
    return 'PAID';
  }
  if (input.status === ClassSessionStatus.CANCELLED) {
    return 'SESSION_CANCELLED';
  }
  if (input.status !== ClassSessionStatus.FINISHED) {
    return 'NOT_FINISHED_YET';
  }
  if (input.rateAmd <= 0) {
    return 'NO_RATE_CONFIGURED';
  }
  if (input.registeredCount === 0) {
    return 'NO_BOOKINGS';
  }
  if (input.attendedCount === 0) {
    return 'NO_SHOW_ONLY';
  }
  // Attended + rate configured but no accrual row yet — the catch-up job
  // (accrueMissingFinishedSessions) hasn't run for this session yet.
  return 'PENDING_ACCRUAL';
}

export function mapSalarySessionRow(
  session: CoachSalarySessionSourceRow,
  rateAmd: number,
): CoachSalarySessionRow {
  const registeredCount = session.bookings.length;
  const attendedCount = session.bookings.filter(
    (booking) => booking.status === BookingStatus.COMPLETED,
  ).length;
  const noShowCount = session.bookings.filter(
    (booking) => booking.status === BookingStatus.MISSED,
  ).length;
  const amountAmd = session.salaryAccrual?.amountAmd ?? 0;

  return {
    id: session.id,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    status: session.status,
    classType: session.classType,
    registeredCount,
    attendedCount,
    noShowCount,
    rateAmd,
    amountAmd,
    reason: resolveSalarySessionReason({
      status: session.status,
      amountAmd,
      rateAmd,
      registeredCount,
      attendedCount,
    }),
  };
}
