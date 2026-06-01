import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminPackagesManagement } from "@/components/admin/admin-packages-management";
import type { AdminClassTypeRow } from "@/components/admin/admin-class-types-modal";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import {
  packageFiltersQueryKey,
  parsePackageFiltersFromSearch,
} from "@/components/admin/admin-packages-url";
import { serverApiJson } from "@/lib/server-api";

export default async function AdminPackagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.packages" });
  const cookie = (await headers()).get("cookie") ?? "";
  const [packagesRes, classTypesRes] = await Promise.all([
    serverApiJson<AdminPackageRow[]>("/memberships/admin/plans", cookie),
    serverApiJson<AdminClassTypeRow[]>("/classes/types", cookie),
  ]);

  if (!packagesRes.ok) {
    return (
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">
          {packagesRes.status === 401 || packagesRes.status === 403
            ? t("errorAuth")
            : t("errorLoad", { status: packagesRes.status })}
        </div>
      </AdminContentFrame>
    );
  }

  const initialFilters = parsePackageFiltersFromSearch(search);
  const classTypes = classTypesRes.ok ? classTypesRes.data : [];

  return (
    <AdminContentFrame description={t("description")}>
      <Suspense fallback={null}>
        <AdminPackagesManagement
          key={packageFiltersQueryKey(initialFilters)}
          packages={packagesRes.data}
          classTypes={classTypes}
          locale={locale}
          initialFilters={initialFilters}
        />
      </Suspense>
    </AdminContentFrame>
  );
}
