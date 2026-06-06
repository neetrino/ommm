import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  AdminScheduleManagement,
  type AdminScheduleClassType,
  type AdminScheduleCoach,
  type AdminScheduleSession,
} from "@/components/admin/admin-schedule-management";
import { resolveScheduleView, type ScheduleView } from "@/components/admin/admin-schedule-view";
import {
  buildAdminScheduleListEndpoint,
  isScheduleListView,
  parseAdminScheduleListPageParams,
  parseScheduleListFilterStateFromSearch,
  type AdminScheduleListPayload,
} from "@/components/admin/admin-schedule-query";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { serverApiJson } from "@/lib/server-api";

export default async function AdminSchedulePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const requestedView = search.view;
  const initialView: ScheduleView = resolveScheduleView(requestedView);
  const listView = isScheduleListView(requestedView);
  const listPage = parseAdminScheduleListPageParams(search);
  const scheduleFilterState = parseScheduleListFilterStateFromSearch(search);
  const t = await getTranslations({ locale, namespace: "adminPages.schedule" });
  const cookie = (await headers()).get("cookie") ?? "";

  const [classTypesRes, coachesRes, packagesRes] = await Promise.all([
    serverApiJson<AdminScheduleClassType[]>("/classes/types", cookie),
    serverApiJson<AdminScheduleCoach[]>("/coaches/admin/list", cookie),
    serverApiJson<AdminPackageRow[]>("/packages/admin/plans", cookie),
  ]);

  if (!classTypesRes.ok || !coachesRes.ok || !packagesRes.ok) {
    const failed = [classTypesRes, coachesRes, packagesRes].find((res) => !res.ok);
    const status = failed && !failed.ok ? failed.status : 500;
    return (
      <div className="app-alert-warn max-w-xl">
        {status === 401 || status === 403 ? t("errorAuth") : t("errorLoad", { status })}
      </div>
    );
  }

  const sessionsRes = listView
    ? await serverApiJson<AdminScheduleListPayload>(
        buildAdminScheduleListEndpoint(
          listPage.take,
          listPage.offset,
          scheduleFilterState,
          packagesRes.data,
          classTypesRes.data,
        ),
        cookie,
      )
    : await serverApiJson<AdminScheduleSession[]>("/classes/admin/sessions", cookie);

  if (!sessionsRes.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {sessionsRes.status === 401 || sessionsRes.status === 403
          ? t("errorAuth")
          : t("errorLoad", { status: sessionsRes.status })}
      </div>
    );
  }

  const sessions = listView
    ? (sessionsRes.data as AdminScheduleListPayload).items
    : (sessionsRes.data as AdminScheduleSession[]);
  const listPagination = listView
    ? {
        total: (sessionsRes.data as AdminScheduleListPayload).total,
        take: (sessionsRes.data as AdminScheduleListPayload).take,
        offset: (sessionsRes.data as AdminScheduleListPayload).offset,
      }
    : null;

  return (
    <AdminContentFrame>
      <Suspense fallback={null}>
        <AdminScheduleManagement
          locale={locale}
          sessions={sessions}
          listPagination={listPagination}
          classTypes={classTypesRes.data}
          packages={packagesRes.data}
          coaches={coachesRes.data}
          initialView={initialView}
          initialFilterState={scheduleFilterState}
        />
      </Suspense>
    </AdminContentFrame>
  );
}
