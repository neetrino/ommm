import { useTranslations } from "next-intl";
import type { CoachSalarySessionRow } from "@/components/coaches/coach-salary-session-types";
import { formatDateTimeForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";

type CoachSalarySessionCardProps = {
  session: CoachSalarySessionRow;
  locale: string;
};

/** Reasons where the attendance counts are moot noise (session never happened yet, or was voided). */
const REASONS_WITHOUT_ATTENDANCE = new Set(["NOT_FINISHED_YET", "SESSION_CANCELLED"]);

function reasonBadgeToneClass(reason: CoachSalarySessionRow["reason"]): string {
  if (reason === "PAID") {
    return "bg-sage-100 text-sage-800";
  }
  if (reason === "NOT_FINISHED_YET" || reason === "PENDING_ACCRUAL") {
    return "bg-sage-50 text-sage-500";
  }
  return "bg-sand-100 text-sand-700";
}

/**
 * One line item behind a coach's monthly salary total. Kept compact:
 * the outcome (paid amount or reason) is the primary, bold element;
 * attendance counts are a small footnote shown only when they matter.
 */
export function CoachSalarySessionCard({ session, locale }: CoachSalarySessionCardProps) {
  const t = useTranslations("coachSalarySession");
  const showAttendance = !REASONS_WITHOUT_ATTENDANCE.has(session.reason);

  return (
    <li className="rounded-2xl border border-sage-100 bg-white px-3.5 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-sage-900">{session.classType.name}</p>
          <p className="mt-0.5 text-xs text-sage-500">{formatDateTimeForUi(session.startsAt, locale)}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-right text-xs font-semibold tabular-nums ${reasonBadgeToneClass(session.reason)}`}
        >
          {t(`reasons.${session.reason}`, {
            amount: formatAmdFromCents(session.amountAmd, locale),
          })}
        </span>
      </div>
      {showAttendance ? (
        <p className="mt-2 text-[11px] text-sage-400">
          {t("attendanceSummary", {
            registered: session.registeredCount,
            attended: session.attendedCount,
            noShow: session.noShowCount,
          })}
        </p>
      ) : null}
    </li>
  );
}
