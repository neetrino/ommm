import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import { CoachSalaryMonthNav } from "@/components/coaches/coach-salary-month-nav";
import { parseCoachSalaryMonthParam } from "@/components/coaches/coach-salary-month";
import { CoachSalarySessionsList } from "@/components/coaches/coach-salary-sessions-list";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import { formatAmdFromCents } from "@/lib/price-amd";
import { serverApiJson } from "@/lib/server-api";

type SalarySummary = {
  totalEarningsCents: number;
  pendingPayoutCents: number;
  paidOutCents: number;
  completedSessions: number;
};

type CoachSalaryPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ month?: string }>;
};

export default async function CoachSalaryPage({
  params,
  searchParams,
}: CoachSalaryPageProps) {
  const { locale } = await params;
  const { month: monthParam } = await searchParams;
  const month = parseCoachSalaryMonthParam(monthParam);
  const t = await getTranslations({ locale, namespace: "coachPages.salary" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<SalarySummary | null>(
    `/coaches/panel/salary?month=${encodeURIComponent(month)}`,
    cookie,
  );

  if (!res.ok) {
    return (
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">
          {t("loadFailed", { status: res.status })}
        </div>
      </AdminContentFrame>
    );
  }

  if (res.data === null) {
    return (
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">{t("noProfile")}</div>
      </AdminContentFrame>
    );
  }

  const data = res.data;
  const labels = {
    total: t("total"),
    pending: t("pending"),
    paid: t("paid"),
    sessions: t("sessions"),
  };

  return (
    <AdminContentFrame>
      <StaffListPageLayout title={t("title")} description={t("monthHint")}>
      <AdminSectionShell
        toolbar={
          <Suspense fallback={null}>
            <CoachSalaryMonthNav locale={locale} month={month} />
          </Suspense>
        }
      >
        <CoachSalaryMetrics locale={locale} data={data} labels={labels} />
      </AdminSectionShell>
      <AdminSectionShell>
        <h2 className="font-serif text-lg text-sage-950">{t("breakdownTitle")}</h2>
        <p className="mt-1 text-xs text-sage-500">{t("breakdownHint")}</p>
        <div className="mt-4">
          <CoachSalarySessionsList
            endpoint="/coaches/panel/salary-sessions"
            month={month}
            locale={locale}
            loadingLabel={t("breakdownLoading")}
            loadFailedLabel={t("breakdownLoadFailed")}
            emptyLabel={t("breakdownEmpty")}
          />
        </div>
      </AdminSectionShell>
      </StaffListPageLayout>
    </AdminContentFrame>
  );
}

function CoachSalaryMetrics({
  locale,
  data,
  labels,
}: {
  locale: string;
  data: SalarySummary;
  labels: {
    total: string;
    pending: string;
    paid: string;
    sessions: string;
  };
}) {
  return (
    <dl className={adminChrome.summaryGridFour}>
      <div className={adminChrome.metricCard}>
        <dt className={adminChrome.metricLabel}>{labels.total}</dt>
        <dd className={adminChrome.metricValue}>
          {formatAmdFromCents(data.totalEarningsCents, locale)}
        </dd>
      </div>
      <div className={adminChrome.metricCard}>
        <dt className={adminChrome.metricLabel}>{labels.pending}</dt>
        <dd className={adminChrome.metricValue}>
          {formatAmdFromCents(data.pendingPayoutCents, locale)}
        </dd>
      </div>
      <div className={adminChrome.metricCard}>
        <dt className={adminChrome.metricLabel}>{labels.paid}</dt>
        <dd className={adminChrome.metricValue}>
          {formatAmdFromCents(data.paidOutCents, locale)}
        </dd>
      </div>
      <div className={adminChrome.metricCard}>
        <dt className={adminChrome.metricLabel}>{labels.sessions}</dt>
        <dd className={adminChrome.metricValue}>{data.completedSessions}</dd>
      </div>
    </dl>
  );
}
