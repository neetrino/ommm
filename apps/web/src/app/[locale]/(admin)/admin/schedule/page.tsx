import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminScheduleRowActions } from "@/components/admin/admin-schedule-row-actions";
import { AdminScheduleShell } from "@/components/admin/admin-schedule-shell";
import type { AdminScheduleItem } from "@/components/admin/admin-schedule-types";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

function formatTimeRange(row: AdminScheduleItem): string {
  if (row.endTime !== null) {
    return `${row.startTime} - ${row.endTime}`;
  }
  if (row.durationMinutes !== null) {
    return `${row.startTime} · ${row.durationMinutes}m`;
  }
  return row.startTime;
}

export default async function AdminSchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.schedule" });
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await serverApiJson<AdminScheduleItem[]>("/schedule/admin", cookie);

  if (!res.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {res.status === 401 || res.status === 403
          ? t("errorAuth")
          : t("errorLoad", { status: res.status })}
      </div>
    );
  }

  return (
    <AccountPageFrame title={t("title")} description={t("description")}>
      <Suspense fallback={null}>
        <AdminScheduleShell>
          <div className={adminChrome.tableWrap}>
            <table className={`${adminChrome.table} table-fixed min-w-[50rem]`}>
              <colgroup>
                <col className="w-[16%]" />
                <col className="w-[14%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
                <col className="w-[14%]" />
                <col className="w-[10%]" />
                <col className="w-[8%]" />
                <col className="w-[8%]" />
              </colgroup>
              <thead className={adminChrome.thead}>
                <tr>
                  <th className={adminChrome.th}>{t("colClassName")}</th>
                  <th className={adminChrome.th}>{t("colDay")}</th>
                  <th className={adminChrome.th}>{t("colTime")}</th>
                  <th className={adminChrome.th}>{t("colCoach")}</th>
                  <th className={adminChrome.th}>{t("colType")}</th>
                  <th className={`${adminChrome.th} text-center`}>{t("colSpots")}</th>
                  <th className={`${adminChrome.th} text-center`}>{t("colStatus")}</th>
                  <th className={`${adminChrome.th} text-center`}>{t("colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {res.data.length === 0 ? (
                  <tr className={adminChrome.tr}>
                    <td className={adminChrome.tdMuted} colSpan={8}>
                      {t("empty")}
                    </td>
                  </tr>
                ) : (
                  res.data.map((row) => (
                    <tr key={row.id} className={adminChrome.tr}>
                      <td className={adminChrome.tdStrong}>{row.className}</td>
                      <td className={adminChrome.td}>{t(`days.${row.dayOfWeek}`)}</td>
                      <td className={adminChrome.td}>{formatTimeRange(row)}</td>
                      <td className={adminChrome.td}>{row.instructorName}</td>
                      <td className={adminChrome.td}>{row.classType}</td>
                      <td className={`${adminChrome.td} text-center`}>{row.availableSpots}</td>
                      <td className={`${adminChrome.td} text-center`}>
                        {row.isActive ? t("statusActive") : t("statusInactive")}
                      </td>
                      <td className={`${adminChrome.td} text-center`}>
                        <AdminScheduleRowActions item={row} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </AdminScheduleShell>
      </Suspense>
    </AccountPageFrame>
  );
}
