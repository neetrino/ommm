import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminPackagesManagement } from "@/components/admin/admin-packages-management";
import { parsePackageFiltersFromSearch } from "@/components/admin/admin-packages-url";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import type { AdminClassTypeRow } from "@/components/admin/admin-types-management";
import { managerBackofficeCapabilities } from "@/lib/backoffice-capabilities";
import { serverApiJson } from "@/lib/server-api";

export default async function ManagerPackagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.packages" });
  const cookie = (await headers()).get("cookie") ?? "";
  const initialFilters = parsePackageFiltersFromSearch(search);
  const [packagesRes, classTypesRes] = await Promise.all([
    serverApiJson<AdminPackageRow[]>("/packages/admin/plans", cookie),
    serverApiJson<AdminClassTypeRow[]>("/classes/types", cookie),
  ]);

  if (!packagesRes.ok || !classTypesRes.ok) {
    const failed = [packagesRes, classTypesRes].find((row) => !row.ok);
    const status = failed && !failed.ok ? failed.status : 500;
    return (
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">
          {status === 401 || status === 403
            ? t("errorAuth")
            : t("errorLoad", { status })}
        </div>
      </AdminContentFrame>
    );
  }

  return (
    <AdminContentFrame>
      <Suspense fallback={null}>
        <AdminPackagesManagement
          packages={packagesRes.data}
          initialClassTypes={classTypesRes.data}
          locale={locale}
          initialFilters={initialFilters}
          capabilities={managerBackofficeCapabilities()}
        />
      </Suspense>
    </AdminContentFrame>
  );
}
