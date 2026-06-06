"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AdminAnalyticsBarList } from "@/components/admin/admin-analytics-bar-list";
import {
  computeAttendanceRate,
  sortBarItems,
} from "@/components/admin/admin-analytics-helpers";
import type { AnalyticsSectionId } from "@/components/admin/admin-analytics-module";
import {
  AnalyticsMetricTable,
  AnalyticsRankTable,
  AnalyticsSectionShell,
} from "@/components/admin/admin-analytics-shared-ui";
import type { AdminAnalyticsPayload } from "@/components/admin/admin-analytics-types";
import { adminChrome } from "@/components/admin/admin-chrome";
import { formatAmdFromCents } from "@/lib/price-amd";

type Props = {
  data: AdminAnalyticsPayload;
  section: AnalyticsSectionId;
};

export function AdminAnalyticsShell({ data, section }: Props) {
  const t = useTranslations("adminPages.analytics");
  const viewMode = data.viewMode;
  const sortKey = data.sortKey;
  const locale = data.locale;

  const tableLabels = {
    metric: t("table.metric"),
    value: t("table.value"),
    rank: t("table.rank"),
    name: t("table.name"),
    count: t("table.count"),
  };

  const revenueSourceItems = useMemo(() => {
    const items = (["package", "dropin", "gift", "other"] as const).map((key) => ({
      key,
      label: t(`sources.${key}`),
      value: data.finance.bySource[key].amountCents,
      displayValue: formatAmdFromCents(data.finance.bySource[key].amountCents, locale),
    }));
    return sortBarItems(items, sortKey);
  }, [data.finance.bySource, locale, sortKey, t]);

  const paymentStatusItems = useMemo(() => {
    const items = data.finance.byStatus.map((entry) => ({
      key: entry.status,
      label: entry.status,
      value: entry.amountCents,
      displayValue: `${formatAmdFromCents(entry.amountCents, locale)} (${entry.count})`,
    }));
    return sortBarItems(items, sortKey);
  }, [data.finance.byStatus, locale, sortKey]);

  const bookingStatusItems = useMemo(() => {
    const summary = data.bookings.summary;
    const items = [
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
    const items = data.coaches.map((coach) => ({
      key: coach.id,
      label: [coach.user.name, coach.user.lastName].filter(Boolean).join(" ") || coach.user.email,
      value: coach.totalClasses,
    }));
    return sortBarItems(items, sortKey).slice(0, 10);
  }, [data.coaches, sortKey]);

  const rangeAttendanceRate = computeAttendanceRate(
    data.bookings.summary.completed,
    data.bookings.summary.missed,
  );

  const todayStatus = data.dashboard.bookingsByStatus;
  const todayAttendanceRate =
    todayStatus !== undefined
      ? computeAttendanceRate(todayStatus.COMPLETED, todayStatus.MISSED)
      : null;

  return (
    <div className="flex flex-col gap-8">
      {section === "overview" ? (
        <>
          {data.bookings.isSampled ? (
            <p
              className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-xs text-amber-900"
              role="status"
            >
              {t("bookingsSampleBanner", {
                limit: data.bookings.sampledLimit,
                total: data.bookings.matchedTotal,
                shown: data.bookings.sampledRowCount,
              })}
            </p>
          ) : null}
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
        </>
      ) : null}

      {section === "revenue" ? (
        <>
          <AnalyticsSectionShell title={t("sections.revenue.title")} hint={t("sections.revenue.hint")}>
            {viewMode === "table" ? (
              <AnalyticsMetricTable
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
          </AnalyticsSectionShell>
          <AnalyticsSectionShell title={t("sections.paymentStatus.title")}>
            {viewMode === "table" ? (
              <AnalyticsMetricTable
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
          </AnalyticsSectionShell>
        </>
      ) : null}

      {section === "bookings" ? (
        <>
          {data.bookings.isSampled ? (
            <p
              className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-xs text-amber-900"
              role="status"
            >
              {t("bookingsSampleBanner", {
                limit: data.bookings.sampledLimit,
                total: data.bookings.matchedTotal,
                shown: data.bookings.sampledRowCount,
              })}
            </p>
          ) : null}
          <AnalyticsSectionShell
            title={t("sections.bookings.title")}
            hint={t("sections.bookings.hint", { limit: data.bookings.sampledLimit })}
          >
            {viewMode === "table" ? (
              <AnalyticsMetricTable
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
          </AnalyticsSectionShell>
          <AnalyticsSectionShell title={t("sections.attendance.title")} hint={t("sections.attendance.hint")}>
            {viewMode === "table" ? (
              <AnalyticsMetricTable
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
          </AnalyticsSectionShell>
          <AnalyticsSectionShell
            title={t("sections.classPopularity.title")}
            hint={t("sections.classPopularity.hint", { limit: data.bookings.sampledLimit })}
            unsupported={classPopularity.length === 0 ? t("sections.classPopularity.empty") : undefined}
          >
            {viewMode === "table" ? (
              <AnalyticsRankTable labels={tableLabels} rows={classPopularity} />
            ) : (
              <AdminAnalyticsBarList
                items={classPopularity}
                emptyLabel={t("empty")}
                ariaLabel={t("sections.classPopularity.chartAria")}
              />
            )}
          </AnalyticsSectionShell>
        </>
      ) : null}

      {section === "members" ? (
        <AnalyticsSectionShell title={t("sections.users.title")} hint={t("sections.users.hint")}>
          {viewMode === "table" ? (
            <AnalyticsMetricTable
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
        </AnalyticsSectionShell>
      ) : null}

      {section === "coaches" ? (
        <>
          <AnalyticsSectionShell
            title={t("sections.coachPerformance.title")}
            hint={t("sections.coachPerformance.hint")}
          >
            <h3 className="text-sm font-semibold text-sage-900">
              {t("sections.coachPerformance.bookingsTitle")}
            </h3>
            {viewMode === "table" ? (
              <AnalyticsRankTable labels={tableLabels} rows={coachBookings} />
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
              <AnalyticsRankTable labels={tableLabels} rows={coachAttendance} />
            ) : (
              <AdminAnalyticsBarList
                items={coachAttendance}
                emptyLabel={t("empty")}
                ariaLabel={t("sections.coachPerformance.attendanceChartAria")}
              />
            )}
          </AnalyticsSectionShell>
          <AnalyticsSectionShell
            title={t("sections.coachRevenue.title")}
            unsupported={t("sections.coachRevenue.unsupported")}
          />
          <AnalyticsSectionShell
            title={t("sections.classRevenue.title")}
            unsupported={t("sections.classRevenue.unsupported")}
          />
          <AnalyticsSectionShell title={t("sections.coachSessions.title")} hint={t("sections.coachSessions.hint")}>
            {viewMode === "table" ? (
              <AnalyticsRankTable labels={tableLabels} rows={coachSessions} />
            ) : (
              <AdminAnalyticsBarList
                items={coachSessions}
                emptyLabel={t("empty")}
                ariaLabel={t("sections.coachSessions.chartAria")}
              />
            )}
          </AnalyticsSectionShell>
        </>
      ) : null}
    </div>
  );
}
