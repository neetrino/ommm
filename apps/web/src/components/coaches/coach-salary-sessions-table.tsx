"use client";

import { useTranslations } from "next-intl";
import { coachSalaryReasonBadgeClass, coachSalaryReasonStatusLabel } from "@/components/coaches/coach-salary-reason-badge";
import type { CoachSalarySessionRow } from "@/components/coaches/coach-salary-session-types";
import { formatDateForUi } from "@/lib/date-display";
import { formatTimeForUiFromIso } from "@/lib/format-time-display";
import { formatAmdFromCents } from "@/lib/price-amd";

type CoachSalarySessionsTableProps = {
  sessions: CoachSalarySessionRow[];
  locale: string;
  totalsLabel: string;
};

/** Stronger spreadsheet chrome so rows read clearly on the pale finance sheet. */
const TABLE_WRAP_CLASS = [
  "overflow-x-auto overscroll-x-contain rounded-2xl",
  "border border-sage-300/70 bg-white",
  "shadow-[0_8px_24px_-18px_rgba(45,40,35,0.28)]",
].join(" ");

const TABLE_CLASS = "w-full min-w-[40rem] border-collapse text-sm";

const THEAD_CLASS =
  "border-b border-sage-300/60 bg-sand-100 text-xs font-semibold uppercase tracking-[0.08em] text-sage-600";

const TH_CLASS = "px-3.5 py-3 font-semibold";

const TD_CLASS = "px-3.5 py-3 text-sage-700";

const TD_STRONG_CLASS = "px-3.5 py-3 font-semibold text-sage-900";

const ROW_CLASS =
  "border-b border-sage-200/80 odd:bg-white even:bg-sand-50/70 last:border-b-0";

const FOOTER_CLASS = "border-t border-sage-300/70 bg-sand-100";

function sumPaidAmountAmd(sessions: CoachSalarySessionRow[]): number {
  return sessions.reduce((sum, session) => sum + (session.reason === "PAID" ? session.amountAmd : 0), 0);
}

function AttendanceStack({ session }: { session: CoachSalarySessionRow }) {
  const capacity = session.capacity;
  if (!Number.isFinite(capacity) || capacity <= 0) {
    return <span>—</span>;
  }
  return (
    <span className="font-semibold tabular-nums text-sage-900">
      {session.attendedCount}/{capacity}
    </span>
  );
}

/** Spreadsheet-style salary breakdown — one session per row, totals in the footer. */
export function CoachSalarySessionsTable({
  sessions,
  locale,
  totalsLabel,
}: CoachSalarySessionsTableProps) {
  const t = useTranslations("coachSalarySession");
  const pageTotalAmd = sumPaidAmountAmd(sessions);

  return (
    <div className={TABLE_WRAP_CLASS}>
      <table className={TABLE_CLASS}>
        <thead className={THEAD_CLASS}>
          <tr>
            <th className={`${TH_CLASS} text-left`}>{t("colClass")}</th>
            <th className={`${TH_CLASS} text-center`}>{t("colLessonDate")}</th>
            <th className={`${TH_CLASS} text-center`}>{t("colAttendance")}</th>
            <th className={`${TH_CLASS} text-center`}>{t("colRate")}</th>
            <th className={`${TH_CLASS} text-center`}>{t("colSalary")}</th>
            <th className={`${TH_CLASS} text-center`}>{t("colStatus")}</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id} className={ROW_CLASS}>
              <td className={TD_STRONG_CLASS}>{session.classType.name}</td>
              <td className={`${TD_CLASS} text-center`}>
                <span className="block font-medium text-sage-900">
                  {formatDateForUi(session.startsAt)}
                </span>
                <span className="mt-0.5 block text-xs text-sage-500">
                  {formatTimeForUiFromIso(session.startsAt, locale)}
                </span>
              </td>
              <td className={`${TD_CLASS} text-center tabular-nums`}>
                <AttendanceStack session={session} />
              </td>
              <td className={`${TD_CLASS} text-center tabular-nums`}>
                {session.rateAmd > 0 ? formatAmdFromCents(session.rateAmd, locale) : "—"}
              </td>
              <td className={`${TD_STRONG_CLASS} text-center tabular-nums`}>
                {session.reason === "PAID"
                  ? formatAmdFromCents(session.amountAmd, locale)
                  : "—"}
              </td>
              <td className={`${TD_CLASS} text-center`}>
                <span className={coachSalaryReasonBadgeClass(session.reason)}>
                  {coachSalaryReasonStatusLabel(session.reason)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className={FOOTER_CLASS}>
            <td className={`${TD_STRONG_CLASS} uppercase tracking-wide text-sage-600`} colSpan={4}>
              {totalsLabel}
            </td>
            <td className={`${TD_STRONG_CLASS} text-center tabular-nums`}>
              {formatAmdFromCents(pageTotalAmd, locale)}
            </td>
            <td className={TD_CLASS} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
