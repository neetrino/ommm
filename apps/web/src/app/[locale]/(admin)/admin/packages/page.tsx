import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminClassPackagesManagement } from "@/components/admin/admin-class-packages-management";
import type {
  ClassPackageQuickFilter,
  ClassPackageSortOrder,
} from "@/components/admin/admin-class-packages-types";
import type {
  AdminClassPackageCoachRow,
  AdminClassPackageSessionRow,
  AdminClassTypeRow,
} from "@/components/admin/admin-class-packages-types";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { serverApiJson } from "@/lib/server-api";

type AdminSessionListRow = AdminClassPackageSessionRow & {
  classType: { id: string; name: string };
};

export default async function AdminPackagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    search?: string;
    level?: string;
    coachId?: string;
    order?: string;
    quick?: string;
  }>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.packages" });
  const cookie = (await headers()).get("cookie") ?? "";

  const [typesRes, coachesRes, sessionsRes] = await Promise.all([
    serverApiJson<AdminClassTypeRow[]>("/classes/types", cookie),
    serverApiJson<AdminClassPackageCoachRow[]>("/coaches/admin/list", cookie),
    serverApiJson<AdminSessionListRow[]>("/classes/admin/sessions", cookie),
  ]);

  if (!typesRes.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {typesRes.status === 401 || typesRes.status === 403
          ? t("errorAuth")
          : t("errorLoad", { status: typesRes.status })}
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

  if (!sessionsRes.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {sessionsRes.status === 401 || sessionsRes.status === 403
          ? t("errorAuth")
          : t("errorLoad", { status: sessionsRes.status })}
      </div>
    );
  }

  const order = parsePackageSort(search.order);
  const quick = parsePackageQuick(search.quick);

  const sessions: AdminClassPackageSessionRow[] = sessionsRes.data.map((row) => ({
    id: row.id,
    classTypeId: row.classTypeId,
    capacity: row.capacity,
    level: row.level,
    priceCents: row.priceCents,
    _count: row._count,
  }));

  return (
    <AccountPageFrame title={t("title")} description={t("description")}>
      <Suspense fallback={null}>
        <AdminClassPackagesManagement
          classTypes={typesRes.data}
          coaches={coachesRes.data}
          sessions={sessions}
          locale={locale}
          initialFilters={{
            search: search.search,
            level: search.level,
            coachId: search.coachId,
            order,
            quick,
          }}
        />
      </Suspense>
    </AccountPageFrame>
  );
}

function parsePackageSort(value: string | undefined): ClassPackageSortOrder | undefined {
  const allowed: ClassPackageSortOrder[] = [
    "newest",
    "oldest",
    "capacityHigh",
    "capacityLow",
    "priceHigh",
    "priceLow",
  ];
  return allowed.includes(value as ClassPackageSortOrder)
    ? (value as ClassPackageSortOrder)
    : undefined;
}

function parsePackageQuick(value: string | undefined): ClassPackageQuickFilter | undefined {
  const allowed: ClassPackageQuickFilter[] = [
    "",
    "popular",
    "highCapacity",
    "lowCapacity",
    "beginner",
    "advanced",
    "withCoaches",
  ];
  return allowed.includes(value as ClassPackageQuickFilter)
    ? (value as ClassPackageQuickFilter)
    : undefined;
}
