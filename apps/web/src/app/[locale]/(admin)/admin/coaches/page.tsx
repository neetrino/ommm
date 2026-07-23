import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminCoachesDirectory } from "@/components/admin/admin-coaches-directory";
import { AdminCoachesShell } from "@/components/admin/admin-coaches-shell";
import {
  buildAdminCoachesListEndpoint,
  parseAdminCoachesPageParams,
  pickAdminCoachesFilters,
  type AdminCoachesListPayload,
} from "@/components/admin/admin-coaches-query";
import { fetchPublicScheduleItems } from "@/components/marketing/schedule/marketing-schedule-data";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { serverApiJson } from "@/lib/server-api";

type ClassTypeRow = {
  id: string;
  name: string;
};

export default async function AdminCoachesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.coaches" });
  const cookie = (await headers()).get("cookie") ?? "";
  const filters = pickAdminCoachesFilters(search);
  const listPage = parseAdminCoachesPageParams(search);
  const coachesEndpoint = buildAdminCoachesListEndpoint(
    filters,
    listPage.take,
    listPage.offset,
  );
  const [res, scheduleData, classTypesRes] = await Promise.all([
    serverApiJson<AdminCoachesListPayload>(coachesEndpoint, cookie),
    fetchPublicScheduleItems(),
    serverApiJson<ClassTypeRow[]>("/classes/types", cookie),
  ]);
  const classTypeOptions = scheduleData.classTypes;
  const classOptions = classTypesRes.ok
    ? classTypesRes.data.map((item) => ({ id: item.id, name: item.name }))
    : [];

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
    <AdminContentFrame>
      <Suspense fallback={null}>
        <AdminCoachesShell
          classTypeOptions={classTypeOptions}
          classOptions={classOptions}
          filterInitialValues={filters}
        >
          <AdminCoachesDirectory
            initial={res.data}
            classTypeOptions={classTypeOptions}
            classOptions={classOptions}
            locale={locale}
          />
        </AdminCoachesShell>
      </Suspense>
    </AdminContentFrame>
  );
}
