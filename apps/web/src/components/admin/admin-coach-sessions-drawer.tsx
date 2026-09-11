"use client";

import { useId, useMemo } from "react";
import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import {
  ADMIN_DETAILS_SHEET_BODY_CLASS,
  ADMIN_DETAILS_SHEET_HEADER_CLASS,
  ADMIN_DETAILS_SHEET_OVERLAY_CLASS,
  ADMIN_DETAILS_SHEET_TITLE_CLASS,
  ADMIN_FINANCE_SESSIONS_SHEET_PANEL_CLASS,
} from "@/components/admin/admin-details-sheet-layout";
import type { CoachFinanceRow } from "@/components/admin/admin-finance-types";
import { CoachSalarySessionsList } from "@/components/coaches/coach-salary-sessions-list";
import { coachCardDisplayName } from "@/components/coaches/coach-card-display";
import { AdminSheetPortal } from "@/components/admin/admin-sheet-portal";
import { useAdminAnimatedSheetClose } from "@/components/admin/use-admin-animated-sheet-close";
import { OmmButton } from "@/components/ui/omm-button";
import { formatAmdFromCents } from "@/lib/price-amd";
import { formatScheduleMonthTitle } from "@/components/marketing/schedule/schedule-date-utils";

type Props = {
  coach: CoachFinanceRow | null;
  locale: string;
  month: string;
  onClose: () => void;
};

function formatSalaryMonthLabel(locale: string, yearMonth: string): string {
  const [yearRaw, monthRaw] = yearMonth.split("-");
  const year = Number(yearRaw);
  const monthIndex = Number(monthRaw) - 1;
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) {
    return yearMonth;
  }
  const date = new Date(year, monthIndex, 1);
  return `${formatScheduleMonthTitle(locale, date)} ${year}`;
}

type SummaryMetric = {
  key: string;
  label: string;
  value: string;
};

function buildSummaryMetrics(
  coach: CoachFinanceRow,
  locale: string,
  labels: {
    lessons: string;
    earnings: string;
    pending: string;
    paid: string;
  },
): SummaryMetric[] {
  const salary = coach.salary;
  const lessons = salary?.completedSessions ?? coach.totalClasses;
  return [
    {
      key: "lessons",
      label: labels.lessons,
      value: String(lessons),
    },
    {
      key: "earnings",
      label: labels.earnings,
      value: formatAmdFromCents(salary?.totalEarningsCents ?? 0, locale),
    },
    {
      key: "pending",
      label: labels.pending,
      value: formatAmdFromCents(salary?.pendingPayoutCents ?? 0, locale),
    },
    {
      key: "paid",
      label: labels.paid,
      value: formatAmdFromCents(salary?.paidOutCents ?? 0, locale),
    },
  ];
}

export function AdminCoachSessionsDrawer({ coach, locale, month, onClose }: Props) {
  const t = useTranslations("adminPages.finance.coachDrawer");
  const titleId = useId();
  const { isOpen: sheetOpen, requestClose, onAfterClose } = useAdminAnimatedSheetClose(onClose, {
    openKey: coach?.coachProfileId ?? null,
  });

  const coachName = useMemo(
    () =>
      coach !== null
        ? coachCardDisplayName({
            name: coach.user.name,
            lastName: coach.user.lastName,
            email: coach.user.email,
            avatarUrl: null,
          })
        : "",
    [coach],
  );

  const monthLabel = useMemo(() => formatSalaryMonthLabel(locale, month), [locale, month]);

  const summaryMetrics = useMemo(() => {
    if (coach === null) {
      return [];
    }
    return buildSummaryMetrics(coach, locale, {
      lessons: t("metricLessons"),
      earnings: t("metricEarnings"),
      pending: t("metricPending"),
      paid: t("metricPaid"),
    });
  }, [coach, locale, t]);

  return (
    <AdminSheetPortal
      presentation="drawer"
      isOpen={coach !== null && sheetOpen}
      onClose={requestClose}
      onAfterClose={onAfterClose}
      backdropAriaLabel={t("close")}
      ariaLabelledBy={titleId}
      drawerOverlayClassName={ADMIN_DETAILS_SHEET_OVERLAY_CLASS}
      drawerPanelClassName={ADMIN_FINANCE_SESSIONS_SHEET_PANEL_CLASS}
    >
      <header className={ADMIN_DETAILS_SHEET_HEADER_CLASS}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className={ADMIN_DETAILS_SHEET_TITLE_CLASS}>
              {coachName}
            </h2>
            <p className="mt-1 text-sm text-sage-600">{t("monthLabel", { month: monthLabel })}</p>
          </div>
          <OmmButton type="button" variant="ghost" size="sm" onClick={requestClose}>
            {t("close")}
          </OmmButton>
        </div>
        <p className="mt-3 text-xs text-sage-500">{t("earningsHint")}</p>
      </header>
      <div className={ADMIN_DETAILS_SHEET_BODY_CLASS}>
        {coach !== null ? (
          <div className="space-y-5">
            <dl className={adminChrome.summaryGridFour}>
              {summaryMetrics.map((metric) => (
                <div key={metric.key} className={adminChrome.metricCard}>
                  <dt className={adminChrome.metricLabel}>{metric.label}</dt>
                  <dd className={adminChrome.metricValue}>{metric.value}</dd>
                  {metric.key === "lessons" ? (
                    <p className="mt-1 text-xs text-sage-500">{monthLabel}</p>
                  ) : null}
                </div>
              ))}
            </dl>
            <CoachSalarySessionsList
              endpoint={`/coaches/admin/${coach.coachProfileId}/salary-sessions`}
              month={month}
              locale={locale}
              variant="table"
              totalsLabel={t("totals")}
              loadingLabel={t("loading")}
              loadFailedLabel={t("loadFailed")}
              emptyLabel={t("empty")}
            />
          </div>
        ) : null}
      </div>
    </AdminSheetPortal>
  );
}
