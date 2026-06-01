import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminCoachesDirectory } from "@/components/admin/admin-coaches-directory";
import { AdminCoachesFilters } from "@/components/admin/admin-coaches-filters";
import { AdminCoachesShell } from "@/components/admin/admin-coaches-shell";
import { fetchPublicScheduleItems } from "@/components/marketing/schedule/marketing-schedule-data";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
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
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  totalClasses: number;
  substituteClasses: number;
  user: {
    id: string;
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
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    specialization?: string;
    classType?: string;
    isActive?: string;
    order?: string;
  }>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.coaches" });
  const cookie = (await headers()).get("cookie") ?? "";
  const q = search.q?.trim() ?? "";
  const specialization = search.specialization?.trim() ?? "";
  const classType = search.classType?.trim() ?? "";
  const isActive =
    search.isActive === "active" || search.isActive === "inactive"
      ? search.isActive
      : "all";
  const order = search.order === "oldest" ? "oldest" : "newest";
  const apiSearch = new URLSearchParams();
  if (q.length > 0) {
    apiSearch.set("q", q);
  }
  if (specialization.length > 0) {
    apiSearch.set("specialization", specialization);
  }
  if (classType.length > 0) {
    apiSearch.set("classType", classType);
  }
  if (isActive !== "all") {
    apiSearch.set("isActive", isActive);
  }
  if (order !== "newest") {
    apiSearch.set("order", order);
  }
  const coachesEndpoint =
    apiSearch.size > 0 ? `/coaches/admin/list?${apiSearch.toString()}` : "/coaches/admin/list";
  const [res, scheduleData, classTypesRes] = await Promise.all([
    serverApiJson<CoachAdminRow[]>(coachesEndpoint, cookie),
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
    <AdminContentFrame description={t("description")}>
      <AdminCoachesFilters
        key={`${q}|${specialization}|${classType}|${isActive}|${order}`}
        initialValues={{ q, specialization, classType, isActive, order }}
        classTypeOptions={classTypeOptions}
      />
      <Suspense fallback={null}>
        <AdminCoachesShell
          classTypeOptions={classTypeOptions}
          classOptions={classOptions}
        >
          <AdminCoachesDirectory
            coaches={res.data}
            classTypeOptions={classTypeOptions}
            classOptions={classOptions}
            locale={locale}
          />
        </AdminCoachesShell>
      </Suspense>
    </AdminContentFrame>
  );
}
