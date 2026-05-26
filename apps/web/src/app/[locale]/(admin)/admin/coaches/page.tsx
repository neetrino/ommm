import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminCoachesDirectory } from "@/components/admin/admin-coaches-directory";
import { AdminCoachesShell } from "@/components/admin/admin-coaches-shell";
import { fetchPublicScheduleItems } from "@/components/marketing/schedule/marketing-schedule-data";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type CoachAdminRow = {
  id: string;
  bio: string | null;
  specialization: string | null;
  classType: string | null;
  assignedClassTypeIds: string[];
  schedule: {
    id: string;
    date: string;
    time: string;
    spots: number;
  }[];
  experienceYears: number | null;
  age: number | null;
  user: {
    name: string | null;
    lastName: string | null;
    email: string;
    phone: string | null;
    dateOfBirth: string | null;
    avatarUrl: string | null;
  };
};

type ClassTypeRow = {
  id: string;
  name: string;
};

export default async function AdminCoachesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.coaches" });
  const cookie = (await headers()).get("cookie") ?? "";
  const [res, scheduleData, classTypesRes] = await Promise.all([
    serverApiJson<CoachAdminRow[]>("/coaches/admin/list", cookie),
    fetchPublicScheduleItems(cookie),
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
    <AccountPageFrame
      title={t("title")}
      description={t("description")}
    >
      <Suspense fallback={null}>
        <AdminCoachesShell
          classTypeOptions={classTypeOptions}
          classOptions={classOptions}
        >
          <AdminCoachesDirectory
            coaches={res.data}
            classTypeOptions={classTypeOptions}
            classOptions={classOptions}
          />
        </AdminCoachesShell>
      </Suspense>
    </AccountPageFrame>
  );
}
