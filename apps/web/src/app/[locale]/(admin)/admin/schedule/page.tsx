import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  AdminScheduleManagement,
  type AdminScheduleClassType,
  type AdminScheduleCoach,
  type AdminScheduleSession,
} from "@/components/admin/admin-schedule-management";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

export default async function AdminSchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.schedule" });
  const cookie = (await headers()).get("cookie") ?? "";
  const [sessionsRes, classTypesRes, coachesRes] = await Promise.all([
    serverApiJson<AdminScheduleSession[]>("/classes/admin/sessions", cookie),
    serverApiJson<AdminScheduleClassType[]>("/classes/types", cookie),
    serverApiJson<AdminScheduleCoach[]>("/coaches/admin/list", cookie),
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

  return (
    <AccountPageFrame title={t("title")} description={t("description")}>
      <Suspense fallback={null}>
        <AdminScheduleManagement
          locale={locale}
          sessions={sessionsRes.data}
          classTypes={classTypesRes.data}
          coaches={coachesRes.data}
        />
      </Suspense>
    </AccountPageFrame>
  );
}
