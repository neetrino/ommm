"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { AdminCoachSalaryExportBar } from "@/components/admin/admin-coach-salary-export-bar";
import { resolveFinanceCoachDefaultDateRange } from "@/components/admin/admin-finance-dates";
import { useCoachSalaryExportRange } from "@/components/admin/use-coach-salary-export-range";
import { CoachSalarySessionsList } from "@/components/coaches/coach-salary-sessions-list";
import { formatDateForUi } from "@/lib/date-display";

type AdminCoachSalarySheetPanelProps = {
  coachProfileId: string;
  locale: string;
};

function formatPeriodLabel(from: string, to: string): string {
  const fromLabel = formatDateForUi(from);
  const toLabel = formatDateForUi(to);
  return from === to ? fromLabel : `${fromLabel} – ${toLabel}`;
}

/** Salary sessions for one coach — date range, Excel export, and the session table. */
export function AdminCoachSalarySheetPanel({
  coachProfileId,
  locale,
}: AdminCoachSalarySheetPanelProps) {
  const t = useTranslations("adminPages.finance.coachDrawer");
  const [committed, setCommitted] = useState(() => resolveFinanceCoachDefaultDateRange());
  const commitRange = useCallback((from: string, to: string) => {
    setCommitted((current) =>
      current.from === from && current.to === to ? current : { from, to },
    );
  }, []);
  const range = useCoachSalaryExportRange(committed.from, committed.to, commitRange);
  const periodLabel = formatPeriodLabel(range.listFrom, range.listTo);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-sage-600">{t("periodLabel", { period: periodLabel })}</p>
        <p className="mt-2 text-xs text-sage-500">{t("earningsHint")}</p>
      </div>
      <AdminCoachSalaryExportBar
        coachProfileId={coachProfileId}
        locale={locale}
        from={range.from}
        to={range.to}
        issue={range.issue}
        onFromChange={range.setFrom}
        onToChange={range.setTo}
      />
      <CoachSalarySessionsList
        endpoint={`/coaches/admin/${coachProfileId}/salary-sessions`}
        from={range.listFrom}
        to={range.listTo}
        locale={locale}
        variant="table"
        totalsLabel={t("totals")}
        loadingLabel={t("loading")}
        loadFailedLabel={t("loadFailed")}
        emptyLabel={t("empty")}
      />
    </div>
  );
}
