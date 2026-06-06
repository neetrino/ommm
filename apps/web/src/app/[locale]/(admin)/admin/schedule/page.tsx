import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  AdminScheduleManagement,
  type AdminScheduleClassType,
  type AdminScheduleCoach,
  type AdminScheduleSession,
  type ScheduleView,
} from "@/components/admin/admin-schedule-management";
import {
  buildAdminScheduleListEndpoint,
  isScheduleListView,
  parseAdminScheduleListPageParams,
  type AdminScheduleListPayload,
} from "@/components/admin/admin-schedule-query";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { serverApiJson } from "@/lib/server-api";

function isScheduleView(value: string | undefined): value is ScheduleView {
  return value === "list" || value === "monthly" || value === "weekly" || value === "daily";
}

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
  const initialView: ScheduleView = isScheduleView(requestedView) ? requestedView : "list";
  const listView = isScheduleListView(requestedView);
  const listPage = parseAdminScheduleListPageParams(search);
  const t = await getTranslations({ locale, namespace: "adminPages.schedule" });
  const cookie = (await headers()).get("cookie") ?? "";

  const sessionsEndpoint = listView
    ? buildAdminScheduleListEndpoint(listPage.take, listPage.offset)
    : "/classes/admin/sessions";

  const [sessionsRes, classTypesRes, coachesRes, packagesRes] = await Promise.all([
    listView
      ? serverApiJson<AdminScheduleListPayload>(sessionsEndpoint, cookie)
      : serverApiJson<AdminScheduleSession[]>(sessionsEndpoint, cookie),
    serverApiJson<AdminScheduleClassType[]>("/classes/types", cookie),
    serverApiJson<AdminScheduleCoach[]>("/coaches/admin/list", cookie),
    serverApiJson<AdminPackageRow[]>("/packages/admin/plans", cookie),
  ]);

  if (!sessionsRes.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {sessionsRes.status === 401 || sessionsRes.status === 403
          ? t("errorAuth")
          : t("errorLoad", { status: sessionsRes.status })}
      </div>
    );
  }

  if (!classTypesRes.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {classTypesRes.status === 401 || classTypesRes.status === 403
          ? t("errorAuth")
          : t("errorLoad", { status: classTypesRes.status })}
      </div>
    );
  }

  if (!coachesRes.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {coachesRes.status === 401 || coachesRes.status === 403
          ? t("errorAuth")
          : t("errorLoad", { status: coachesRes.status })}
      </div>
    );
  }

  if (!packagesRes.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {packagesRes.status === 401 || packagesRes.status === 403
          ? t("errorAuth")
          : t("errorLoad", { status: packagesRes.status })}
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
        />
      </Suspense>
    </AdminContentFrame>
  );
}
