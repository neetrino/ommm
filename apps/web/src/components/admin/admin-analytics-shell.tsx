"use client";

import { useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminAnalyticsBarList } from "@/components/admin/admin-analytics-bar-list";
import { AdminAnalyticsFilters } from "@/components/admin/admin-analytics-filters";
import {
  computeAttendanceRate,
  countMembershipPlans,
  countMembershipStatuses,
  sortBarItems,
} from "@/components/admin/admin-analytics-helpers";
import type {
  AdminAnalyticsPayload,
  AnalyticsBarItem,
  AnalyticsViewMode,
} from "@/components/admin/admin-analytics-types";
import { AdminAnalyticsViewSwitcher } from "@/components/admin/admin-analytics-view-switcher";
import { formatAmdFromCents } from "@/lib/price-amd";

type Props = {
  data: AdminAnalyticsPayload;
};

function MetricTable({
  rows,
  labels,
}: {
  rows: Array<{ label: string; value: string }>;
  labels: { metric: string; value: string };
}) {
  return (
    <div className={adminChrome.tableWrap}>
      <table className={adminChrome.table}>
        <thead className={adminChrome.thead}>
          <tr>
            <th className={adminChrome.th} scope="col">
              {labels.metric}
            </th>
            <th className={adminChrome.th} scope="col">
              {labels.value}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className={adminChrome.tr}>
              <td className={adminChrome.td}>{row.label}</td>
              <td className={adminChrome.tdStrong}>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RankTable({
  rows,
  labels,
}: {
  rows: AnalyticsBarItem[];
  labels: { rank: string; name: string; count: string };
}) {
  return (
    <div className={adminChrome.tableWrap}>
      <table className={adminChrome.table}>
        <thead className={adminChrome.thead}>
          <tr>
            <th className={adminChrome.th} scope="col">
              {labels.rank}
            </th>
            <th className={adminChrome.th} scope="col">
              {labels.name}
            </th>
            <th className={adminChrome.th} scope="col">
              {labels.count}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.key} className={adminChrome.tr}>
              <td className={adminChrome.tdMuted}>{index + 1}</td>
              <td className={adminChrome.tdStrong}>{row.label}</td>
              <td className={adminChrome.td}>{row.displayValue ?? row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionShell({
  title,
  hint,
  unsupported,
  children,
}: {
  title: string;
  hint?: string;
  unsupported?: string;
  children?: ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className={adminChrome.sectionTitle}>{title}</h2>
      {hint ? <p className={adminChrome.metaText}>{hint}</p> : null}
      {unsupported ? (
        <p className="mt-2 rounded-xl border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
          {unsupported}
        </p>
      ) : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </section>
  );
}

export function AdminAnalyticsShell({ data }: Props) {
  const t = useTranslations("adminPages.analytics");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialView = (searchParams.get("view") === "chart" ? "chart" : "table") as AnalyticsViewMode;
  const [viewMode, setViewMode] = useState<AnalyticsViewMode>(initialView);

  const setView = (mode: AnalyticsViewMode) => {
    setViewMode(mode);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", mode);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const sortKey = data.sortKey;
  const locale = data.locale;

  const revenueSourceItems = useMemo(() => {
    const items: AnalyticsBarItem[] = (
      ["membership", "dropin", "gift", "other"] as const
    ).map((key) => ({
      key,
      label: t(`sources.${key}`),
      value: data.finance.bySource[key].amountCents,
      displayValue: formatAmdFromCents(data.finance.bySource[key].amountCents, locale),
    }));
    return sortBarItems(items, sortKey);
  }, [data.finance.bySource, locale, sortKey, t]);

  const paymentStatusItems = useMemo(() => {
    const items: AnalyticsBarItem[] = data.finance.byStatus.map((entry) => ({
      key: entry.status,
      label: entry.status,
      value: entry.amountCents,
      displayValue: `${formatAmdFromCents(entry.amountCents, locale)} (${entry.count})`,
    }));
    return sortBarItems(items, sortKey);
  }, [data.finance.byStatus, locale, sortKey]);

  const bookingStatusItems = useMemo(() => {
    const summary = data.bookings.summary;
    const items: AnalyticsBarItem[] = [
      { key: "booked", label: t("bookingStatus.booked"), value: summary.booked },
      { key: "completed", label: t("bookingStatus.completed"), value: summary.completed },
      { key: "cancelled", label: t("bookingStatus.cancelled"), value: summary.cancelled },
      { key: "missed", label: t("bookingStatus.missed"), value: summary.missed },
      { key: "waitlisted", label: t("bookingStatus.waitlisted"), value: summary.waitlisted },
    ];
    return sortBarItems(items, sortKey);
  }, [data.bookings.summary, sortKey, t]);

  const classPopularity = useMemo(
    () => sortBarItems(data.bookings.classPopularity, sortKey).slice(0, 10),
    [data.bookings.classPopularity, sortKey],
  );

  const coachBookings = useMemo(
    () => sortBarItems(data.bookings.coachBookings, sortKey).slice(0, 10),
    [data.bookings.coachBookings, sortKey],
  );

  const coachAttendance = useMemo(
    () => sortBarItems(data.bookings.coachAttendance, sortKey).slice(0, 10),
    [data.bookings.coachAttendance, sortKey],
  );

  const coachSessions = useMemo(() => {
    const items: AnalyticsBarItem[] = data.coaches.map((coach) => ({
      key: coach.id,
      label: [coach.user.name, coach.user.lastName].filter(Boolean).join(" ") || coach.user.email,
      value: coach.totalClasses,
    }));
    return sortBarItems(items, sortKey).slice(0, 10);
  }, [data.coaches, sortKey]);

  const membershipStatuses = countMembershipStatuses(data.memberships);
  const membershipPlans = sortBarItems(countMembershipPlans(data.memberships), sortKey);

  const rangeAttendanceRate = computeAttendanceRate(
    data.bookings.summary.completed,
    data.bookings.summary.missed,
  );

  const todayStatus = data.dashboard.bookingsByStatus;
  const todayAttendanceRate =
    todayStatus !== undefined
      ? computeAttendanceRate(todayStatus.COMPLETED, todayStatus.MISSED)
      : null;

  const exportBookingsHref = `/api/v1/reports/bookings.csv?from=${encodeURIComponent(data.fromIso)}&to=${encodeURIComponent(data.toIso)}`;
  const exportPaymentsHref = `/api/v1/reports/payments.csv?from=${encodeURIComponent(data.fromIso)}&to=${encodeURIComponent(data.toIso)}`;
  const exportGiftCreditsHref = `/api/v1/reports/gift-credits.csv?from=${encodeURIComponent(data.fromIso)}&to=${encodeURIComponent(data.toIso)}`;

  const tableLabels = {
    metric: t("table.metric"),
    value: t("table.value"),
    rank: t("table.rank"),
    name: t("table.name"),
    count: t("table.count"),
  };

  return (
    <>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <AdminAnalyticsViewSwitcher value={viewMode} onChange={setView} />
        <p className={adminChrome.metaText}>{t("rangeHint", { from: data.fromIso.slice(0, 10), to: data.toIso.slice(0, 10) })}</p>
      </div>

      <div className="mt-4">
        <AdminAnalyticsFilters filterOptions={data.bookings.filterOptions} />
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <li className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("kpiRangeRevenue")}</p>
          <p className={adminChrome.metricValue}>
            {formatAmdFromCents(data.finance.totals.revenueCents, locale)}
          </p>
        </li>
        <li className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("kpiBookingsInRange")}</p>
          <p className={adminChrome.metricValue}>{data.bookings.summary.total}</p>
        </li>
        <li className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("kpiAttendanceRate")}</p>
          <p className={adminChrome.metricValue}>
            {rangeAttendanceRate === null ? t("notAvailable") : `${rangeAttendanceRate}%`}
          </p>
        </li>
        <li className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("kpiActiveMembers")}</p>
          <p className={adminChrome.metricValue}>{data.dashboard.activeMembers}</p>
        </li>
        <li className={adminChrome.metricCard}>
          <p className={adminChrome.metricLabel}>{t("kpiNewUsersToday")}</p>
          <p className={adminChrome.metricValue}>{data.dashboard.newUsers?.todayCount ?? 0}</p>
        </li>
      </ul>

      <SectionShell title={t("sections.revenue.title")} hint={t("sections.revenue.hint")}>
        {viewMode === "table" ? (
          <MetricTable
            labels={tableLabels}
            rows={[
              {
                label: t("sections.revenue.total"),
                value: formatAmdFromCents(data.finance.totals.revenueCents, locale),
              },
              {
                label: t("sections.revenue.payments"),
                value: String(data.finance.totals.successfulPaymentsCount),
              },
              {
                label: t("sections.revenue.aov"),
                value: formatAmdFromCents(data.finance.totals.averageOrderValueCents, locale),
              },
              {
                label: t("sections.revenue.month"),
                value: formatAmdFromCents(data.dashboard.revenue?.monthRevenueCents ?? 0, locale),
              },
            ]}
          />
        ) : (
          <AdminAnalyticsBarList
            items={revenueSourceItems}
            emptyLabel={t("empty")}
            ariaLabel={t("sections.revenue.chartAria")}
          />
        )}
      </SectionShell>

      <SectionShell
        title={t("sections.bookings.title")}
        hint={t("sections.bookings.hint", { limit: data.bookings.sampledLimit })}
      >
        {viewMode === "table" ? (
          <MetricTable
            labels={tableLabels}
            rows={bookingStatusItems.map((row) => ({
              label: row.label,
              value: String(row.value),
            }))}
          />
        ) : (
          <AdminAnalyticsBarList
            items={bookingStatusItems}
            emptyLabel={t("empty")}
            ariaLabel={t("sections.bookings.chartAria")}
          />
        )}
      </SectionShell>

      <SectionShell
        title={t("sections.attendance.title")}
        hint={t("sections.attendance.hint")}
      >
        {viewMode === "table" ? (
          <MetricTable
            labels={tableLabels}
            rows={[
              {
                label: t("sections.attendance.rangeRate"),
                value:
                  rangeAttendanceRate === null ? t("notAvailable") : `${rangeAttendanceRate}%`,
              },
              {
                label: t("sections.attendance.completed"),
                value: String(data.bookings.summary.completed),
              },
              {
                label: t("sections.attendance.missed"),
                value: String(data.bookings.summary.missed),
              },
              {
                label: t("sections.attendance.todayRate"),
                value:
                  todayAttendanceRate === null ? t("notAvailable") : `${todayAttendanceRate}%`,
              },
            ]}
          />
        ) : (
          <AdminAnalyticsBarList
            items={[
              {
                key: "completed",
                label: t("sections.attendance.completed"),
                value: data.bookings.summary.completed,
              },
              {
                key: "missed",
                label: t("sections.attendance.missed"),
                value: data.bookings.summary.missed,
              },
            ]}
            emptyLabel={t("empty")}
            ariaLabel={t("sections.attendance.chartAria")}
          />
        )}
      </SectionShell>

      <SectionShell
        title={t("sections.memberships.title")}
        hint={t("sections.memberships.hint", { limit: data.membershipsSampledLimit })}
      >
        {viewMode === "table" ? (
          <MetricTable
            labels={tableLabels}
            rows={[
              {
                label: t("sections.memberships.activeDashboard"),
                value: String(data.dashboard.activeMembers),
              },
              ...membershipStatuses.map((row) => ({
                label: row.status,
                value: String(row.count),
              })),
            ]}
          />
        ) : (
          <AdminAnalyticsBarList
            items={membershipPlans.slice(0, 10)}
            emptyLabel={t("empty")}
            ariaLabel={t("sections.memberships.chartAria")}
          />
        )}
      </SectionShell>

      <SectionShell title={t("sections.users.title")} hint={t("sections.users.hint")}>
        {viewMode === "table" ? (
          <MetricTable
            labels={tableLabels}
            rows={[
              { label: t("sections.users.total"), value: String(data.clients.total) },
              { label: t("sections.users.active"), value: String(data.clients.active) },
              { label: t("sections.users.vip"), value: String(data.clients.vip) },
              { label: t("sections.users.atRisk"), value: String(data.clients.atRisk) },
              { label: t("sections.users.visits"), value: String(data.clients.totalVisits) },
              {
                label: t("sections.users.ltv"),
                value: formatAmdFromCents(data.clients.lifetimeValueCents, locale),
              },
            ]}
          />
        ) : (
          <AdminAnalyticsBarList
            items={[
              { key: "active", label: t("sections.users.active"), value: data.clients.active },
              { key: "vip", label: t("sections.users.vip"), value: data.clients.vip },
              { key: "atRisk", label: t("sections.users.atRisk"), value: data.clients.atRisk },
            ]}
            emptyLabel={t("empty")}
            ariaLabel={t("sections.users.chartAria")}
          />
        )}
      </SectionShell>

      <SectionShell
        title={t("sections.classPopularity.title")}
        hint={t("sections.classPopularity.hint", { limit: data.bookings.sampledLimit })}
        unsupported={classPopularity.length === 0 ? t("sections.classPopularity.empty") : undefined}
      >
        {viewMode === "table" ? (
          <RankTable labels={tableLabels} rows={classPopularity} />
        ) : (
          <AdminAnalyticsBarList
            items={classPopularity}
            emptyLabel={t("empty")}
            ariaLabel={t("sections.classPopularity.chartAria")}
          />
        )}
      </SectionShell>

      <SectionShell
        title={t("sections.coachPerformance.title")}
        hint={t("sections.coachPerformance.hint")}
      >
        <h3 className="text-sm font-semibold text-sage-900">
          {t("sections.coachPerformance.bookingsTitle")}
        </h3>
        {viewMode === "table" ? (
          <RankTable labels={tableLabels} rows={coachBookings} />
        ) : (
          <AdminAnalyticsBarList
            items={coachBookings}
            emptyLabel={t("empty")}
            ariaLabel={t("sections.coachPerformance.chartAria")}
          />
        )}
        <h3 className="mt-6 text-sm font-semibold text-sage-900">
          {t("sections.coachPerformance.attendanceTitle")}
        </h3>
        {viewMode === "table" ? (
          <RankTable labels={tableLabels} rows={coachAttendance} />
        ) : (
          <AdminAnalyticsBarList
            items={coachAttendance}
            emptyLabel={t("empty")}
            ariaLabel={t("sections.coachPerformance.attendanceChartAria")}
          />
        )}
      </SectionShell>

      <SectionShell
        title={t("sections.coachRevenue.title")}
        unsupported={t("sections.coachRevenue.unsupported")}
      />

      <SectionShell
        title={t("sections.classRevenue.title")}
        unsupported={t("sections.classRevenue.unsupported")}
      />

      <SectionShell title={t("sections.coachSessions.title")} hint={t("sections.coachSessions.hint")}>
        {viewMode === "table" ? (
          <RankTable labels={tableLabels} rows={coachSessions} />
        ) : (
          <AdminAnalyticsBarList
            items={coachSessions}
            emptyLabel={t("empty")}
            ariaLabel={t("sections.coachSessions.chartAria")}
          />
        )}
      </SectionShell>

      <SectionShell title={t("sections.paymentStatus.title")}>
        {viewMode === "table" ? (
          <MetricTable
            labels={tableLabels}
            rows={paymentStatusItems.map((row) => ({
              label: row.label,
              value: row.displayValue ?? String(row.value),
            }))}
          />
        ) : (
          <AdminAnalyticsBarList
            items={paymentStatusItems}
            emptyLabel={t("empty")}
            ariaLabel={t("sections.paymentStatus.chartAria")}
          />
        )}
      </SectionShell>

      <section className="mt-8 rounded-[20px] border border-white/60 bg-white/70 p-4 text-sm text-sage-700">
        <p className="font-medium text-sage-900">{t("export.heading")}</p>
        <p className="mt-2 text-xs text-sage-600">{t("export.hint")}</p>
        <p className="mt-2 text-xs text-amber-800">{t("export.excelUnsupported")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            className="inline-flex rounded-xl border border-sage-300 bg-white px-3 py-2 text-xs font-medium text-sage-700"
            href={exportPaymentsHref}
          >
            {t("export.paymentsCsv")}
          </a>
          <a
            className="inline-flex rounded-xl border border-sage-300 bg-white px-3 py-2 text-xs font-medium text-sage-700"
            href={exportBookingsHref}
          >
            {t("export.bookingsCsv")}
          </a>
          <a
            className="inline-flex rounded-xl border border-sage-300 bg-white px-3 py-2 text-xs font-medium text-sage-700"
            href={exportGiftCreditsHref}
          >
            {t("export.giftCreditsCsv")}
          </a>
        </div>
      </section>

      <section className="mt-8 rounded-[20px] border border-white/60 bg-white/70 p-4 text-sm text-sage-700">
        <p className="font-medium text-sage-900">{t("limitations.heading")}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-sage-600">
          <li>{t("limitations.noTimeSeries")}</li>
          <li>{t("limitations.bookingsSample")}</li>
          <li>{t("limitations.noCoachRevenue")}</li>
          <li>{t("limitations.noClassRevenue")}</li>
          <li>{t("limitations.noRetention")}</li>
        </ul>
      </section>
    </>
  );
}
