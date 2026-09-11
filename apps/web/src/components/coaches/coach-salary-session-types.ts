/**
 * Per-session salary breakdown — shared shape between the admin
 * ("any coach") and coach panel ("self") breakdown endpoints/views.
 */

/** Why a session did or didn't contribute to the coach's monthly salary. */
export type CoachSalarySessionReason =
  | "PAID"
  | "NOT_FINISHED_YET"
  | "SESSION_CANCELLED"
  | "NO_RATE_CONFIGURED"
  | "NO_BOOKINGS"
  | "NO_SHOW_ONLY"
  | "PENDING_ACCRUAL";

export type CoachSalarySessionRow = {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  classType: { id: string; name: string };
  capacity: number;
  registeredCount: number;
  attendedCount: number;
  noShowCount: number;
  rateAmd: number;
  amountAmd: number;
  reason: CoachSalarySessionReason;
};

export type CoachSalarySessionsPayload = {
  items: CoachSalarySessionRow[];
  total: number;
  take: number;
  offset: number;
};
