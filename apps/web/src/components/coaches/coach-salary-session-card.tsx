import { useTranslations } from "next-intl";
import { coachSalaryReasonBadgeClass } from "@/components/coaches/coach-salary-reason-badge";
import type { CoachSalarySessionRow } from "@/components/coaches/coach-salary-session-types";
import { formatDateTimeForUi } from "@/lib/date-display";
import { formatAmdFromCents } from "@/lib/price-amd";

type CoachSalarySessionCardProps = {
  session: CoachSalarySessionRow;
  locale: string;
};

/** Reasons where the attendance counts are moot noise (session never happened yet, or was voided). */
const REASONS_WITHOUT_ATTENDANCE = new Set(["NOT_FINISHED_YET", "SESSION_CANCELLED"]);

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
        <span className={`shrink-0 text-right tabular-nums ${coachSalaryReasonBadgeClass(session.reason)}`}>
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
