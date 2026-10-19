import type { CoachSalarySessionReason } from "@/components/coaches/coach-salary-session-types";

const STATUS_PILL_BASE_CLASS =
  "inline-flex max-w-full items-center justify-center rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-tight tracking-wide";

/** Colorful status pills for salary session reasons (table + cards). */
export function coachSalaryReasonBadgeClass(reason: CoachSalarySessionReason): string {
  if (reason === "PAID") {
    return `${STATUS_PILL_BASE_CLASS} border-emerald-300 bg-emerald-100 text-emerald-800`;
  }
  if (reason === "NOT_FINISHED_YET") {
    return `${STATUS_PILL_BASE_CLASS} border-sage-200 bg-sage-50 text-sage-600`;
  }
  if (reason === "PENDING_ACCRUAL") {
    return `${STATUS_PILL_BASE_CLASS} border-amber-200 bg-amber-50 text-amber-900`;
  }
  if (reason === "SESSION_CANCELLED") {
    return `${STATUS_PILL_BASE_CLASS} border-red-200 bg-red-50 text-red-700`;
  }
  if (reason === "NO_RATE_CONFIGURED") {
    return `${STATUS_PILL_BASE_CLASS} border-amber-200 bg-amber-50 text-amber-900`;
  }
  if (reason === "NO_BOOKINGS") {
    return `${STATUS_PILL_BASE_CLASS} border-sand-500/45 bg-sand-100 text-sand-800`;
  }
  // NO_SHOW_ONLY
  return `${STATUS_PILL_BASE_CLASS} border-red-200/80 bg-red-50/80 text-red-800`;
}

const COACH_SALARY_REASON_STATUS_LABELS: Record<CoachSalarySessionReason, string> = {
  PAID: "COMPLETED",
  NOT_FINISHED_YET: "NOT FINISHED YET",
  SESSION_CANCELLED: "CANCELED",
  NO_RATE_CONFIGURED: "NO RATE SET",
  NO_BOOKINGS: "NOBODY BOOKED",
  NO_SHOW_ONLY: "NO SHOW",
  PENDING_ACCRUAL: "CALCULATING",
};

/** Status labels shown in the finance salary breakdown. */
export function coachSalaryReasonStatusLabel(reason: CoachSalarySessionReason): string {
  return COACH_SALARY_REASON_STATUS_LABELS[reason];
}
