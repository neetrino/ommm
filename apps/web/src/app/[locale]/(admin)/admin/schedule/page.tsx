import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminScheduleDayView } from "@/components/admin/admin-schedule-day-view";
import { AdminScheduleShell } from "@/components/admin/admin-schedule-shell";
import type { AdminScheduleItem } from "@/components/admin/admin-schedule-types";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type ClassTypeRow = {
  id: string;
  name: string;
  slug: string;
};

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
          <AdminScheduleDayView
            locale={locale}
            items={scheduleRes.data}
            classTypeOptions={classTypeOptions}
          />
        </AdminScheduleShell>
      </Suspense>
    </AccountPageFrame>
  );
}
