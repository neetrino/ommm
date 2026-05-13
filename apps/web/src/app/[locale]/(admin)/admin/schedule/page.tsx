import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminScheduleRowActions } from "@/components/admin/admin-schedule-row-actions";
import { AdminScheduleShell } from "@/components/admin/admin-schedule-shell";
import type { AdminScheduleItem } from "@/components/admin/admin-schedule-types";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type ClassTypeRow = {
  id: string;
  name: string;
  slug: string;
};

function toLocaleTimeLabel(locale: string, hhmm: string): string {
  const [hour, minute] = hhmm.split(":").map((part) => Number(part));
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return hhmm;
  }
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function formatTimeRange(locale: string, row: AdminScheduleItem): string {
  const start = toLocaleTimeLabel(locale, row.startTime);
  if (row.endTime !== null) {
    return `${start} - ${toLocaleTimeLabel(locale, row.endTime)}`;
  }
  if (row.durationMinutes !== null) {
    return `${start} · ${row.durationMinutes}m`;
  }
  return start;
}

function statusBadgeClasses(active: boolean): string {
  return active
    ? "inline-flex rounded-full border border-mint-200/80 bg-mint-50/90 px-2 py-0.5 text-[11px] font-medium text-sage-800"
    : "inline-flex rounded-full border border-sand-300/80 bg-sand-100/80 px-2 py-0.5 text-[11px] font-medium text-sage-700";
}

export default async function AdminSchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.schedule" });
  const cookie = (await headers()).get("cookie") ?? "";
  const [scheduleRes, classTypesRes] = await Promise.all([
    serverApiJson<AdminScheduleItem[]>("/schedule/admin", cookie),
    serverApiJson<ClassTypeRow[]>("/classes/types", cookie),
  ]);

  if (!scheduleRes.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {scheduleRes.status === 401 || scheduleRes.status === 403
          ? t("errorAuth")
          : t("errorLoad", { status: scheduleRes.status })}
      </div>
    );
  }

  const classTypeOptions =
    classTypesRes.ok && classTypesRes.data.length > 0
      ? classTypesRes.data.map((row) => row.name)
      : Array.from(new Set(scheduleRes.data.map((row) => row.classType))).sort((a, b) =>
          a.localeCompare(b),
        );

  return (
    <AccountPageFrame title={t("title")} description={t("description")}>
      <Suspense fallback={null}>
        <AdminScheduleShell classTypeOptions={classTypeOptions}>
          <div className="space-y-4">
            <div className="md:hidden space-y-3">
              {scheduleRes.data.length === 0 ? (
                <div className={adminChrome.panel}>{t("empty")}</div>
              ) : (
                scheduleRes.data.map((row) => (
                  <article
                    key={row.id}
                    className="rounded-[20px] border border-white/60 bg-white/60 p-4 shadow-[0_12px_28px_-22px_rgba(45,40,35,0.28)] backdrop-blur-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className="truncate text-sm font-semibold text-sage-900"
                          title={row.className}
                        >
                          {row.className}
                        </p>
                        <p className="mt-0.5 text-xs text-sage-600">
                          {t(`days.${row.dayOfWeek}`)} · {formatTimeRange(locale, row)}
                        </p>
                      </div>
                      <span className={statusBadgeClasses(row.isActive)}>
                        {row.isActive ? t("statusActive") : t("statusInactive")}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-sage-700">
                      <p className="truncate" title={row.instructorName}>
                        {t("colCoach")}: {row.instructorName}
                      </p>
                      <p className="truncate" title={row.classType}>
                        {t("colType")}: {row.classType}
                      </p>
                      <p className="col-span-2">
                        {t("colSpots")}:{" "}
                        <span className="inline-flex rounded-full border border-white/60 bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-sage-800">
                          {row.availableSpots}
                        </span>
                      </p>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <AdminScheduleRowActions item={row} classTypeOptions={classTypeOptions} />
                    </div>
                  </article>
                ))
              )}
            </div>

            <div className="hidden overflow-hidden rounded-[24px] border border-white/60 bg-white/55 shadow-[0_12px_32px_-24px_rgba(45,40,35,0.22)] backdrop-blur-md md:block">
              <table className="w-full table-fixed border-collapse text-left text-xs text-sage-700 lg:text-sm">
                <colgroup>
                  <col className="w-[20%]" />
                  <col className="w-[11%]" />
                  <col className="w-[15%]" />
                  <col className="w-[18%]" />
                  <col className="w-[14%]" />
                  <col className="w-[7%]" />
                  <col className="w-[8%]" />
                  <col className="w-[7%]" />
                </colgroup>
                <thead className="border-b border-white/50 bg-white/35 text-[10px] uppercase tracking-wide text-sage-500 lg:text-xs">
                  <tr>
                    <th className="px-2 py-2.5 font-medium lg:px-3">{t("colClassName")}</th>
                    <th className="px-2 py-2.5 font-medium lg:px-3">{t("colDay")}</th>
                    <th className="px-2 py-2.5 font-medium lg:px-3">{t("colTime")}</th>
                    <th className="px-2 py-2.5 font-medium lg:px-3">{t("colCoach")}</th>
                    <th className="px-2 py-2.5 font-medium lg:px-3">{t("colType")}</th>
                    <th className="px-2 py-2.5 text-center font-medium lg:px-3">{t("colSpots")}</th>
                    <th className="px-2 py-2.5 text-center font-medium lg:px-3">{t("colStatus")}</th>
                    <th className="px-2 py-2.5 text-center font-medium lg:px-3">{t("colActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleRes.data.length === 0 ? (
                    <tr className={adminChrome.tr}>
                      <td className={adminChrome.tdMuted} colSpan={8}>
                        {t("empty")}
                      </td>
                    </tr>
                  ) : (
                    scheduleRes.data.map((row) => (
                      <tr key={row.id} className="border-b border-white/40 last:border-b-0">
                        <td className="px-2 py-2.5 lg:px-3">
                          <p className="truncate font-medium text-sage-900" title={row.className}>
                            {row.className}
                          </p>
                        </td>
                        <td className="px-2 py-2.5 lg:px-3">
                          <p className="truncate" title={t(`days.${row.dayOfWeek}`)}>
                            {t(`days.${row.dayOfWeek}`)}
                          </p>
                        </td>
                        <td className="px-2 py-2.5 lg:px-3">
                          <p className="truncate tabular-nums" title={formatTimeRange(locale, row)}>
                            {formatTimeRange(locale, row)}
                          </p>
                        </td>
                        <td className="px-2 py-2.5 lg:px-3">
                          <p className="truncate" title={row.instructorName}>
                            {row.instructorName}
                          </p>
                        </td>
                        <td className="px-2 py-2.5 lg:px-3">
                          <p className="truncate" title={row.classType}>
                            {row.classType}
                          </p>
                        </td>
                        <td className="px-2 py-2.5 text-center lg:px-3">
                          <span className="inline-flex min-w-8 justify-center rounded-full border border-white/60 bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-sage-800">
                            {row.availableSpots}
                          </span>
                        </td>
                        <td className="px-2 py-2.5 text-center lg:px-3">
                          <span className={statusBadgeClasses(row.isActive)}>
                            {row.isActive ? t("statusActive") : t("statusInactive")}
                          </span>
                        </td>
                        <td className="px-2 py-2.5 text-center lg:px-3">
                          <AdminScheduleRowActions
                            item={row}
                            classTypeOptions={classTypeOptions}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </AdminScheduleShell>
      </Suspense>
    </AccountPageFrame>
  );
}
