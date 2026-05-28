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
    <AccountPageFrame
      title={t("title")}
      description={t("description")}
    >
      <form className="mt-2 grid gap-3 rounded-2xl border border-white/60 bg-white/70 p-3 sm:grid-cols-5">
        <label className="flex flex-col gap-1 text-xs text-sage-700">
          <span>{t("filters.searchLabel")}</span>
          <input
            name="q"
            defaultValue={q}
            placeholder={t("filters.searchPlaceholder")}
            className="ommm-input h-10"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-sage-700">
          <span>{t("filters.specializationLabel")}</span>
          <input
            name="specialization"
            defaultValue={specialization}
            placeholder={t("filters.specializationPlaceholder")}
            className="ommm-input h-10"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-sage-700">
          <span>{t("filters.classTypeLabel")}</span>
          <input
            name="classType"
            defaultValue={classType}
            placeholder={t("filters.classTypePlaceholder")}
            className="ommm-input h-10"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-sage-700">
          <span>{t("filters.statusLabel")}</span>
          <select name="isActive" defaultValue={isActive} className="ommm-input h-10">
            <option value="all">{t("filters.statusAll")}</option>
            <option value="active">{t("filters.statusActive")}</option>
            <option value="inactive">{t("filters.statusInactive")}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-sage-700">
          <span>{t("filters.orderLabel")}</span>
          <select name="order" defaultValue={order} className="ommm-input h-10">
            <option value="newest">{t("filters.orderNewest")}</option>
            <option value="oldest">{t("filters.orderOldest")}</option>
          </select>
        </label>
        <div className="sm:col-span-5">
          <button type="submit" className="ommm-cta-secondary h-10 px-5">
            {t("filters.apply")}
          </button>
        </div>
      </form>
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
