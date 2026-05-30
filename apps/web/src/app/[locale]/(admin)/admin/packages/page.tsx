import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminPackagesManagement } from "@/components/admin/admin-packages-management";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import {
  packageFiltersQueryKey,
  parsePackageFiltersFromSearch,
} from "@/components/admin/admin-packages-url";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
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
  const res = await serverApiJson<AdminPackageRow[]>("/memberships/admin/plans", cookie);

  if (!res.ok) {
    return (
      <div className="app-alert-warn max-w-xl">
        {res.status === 401 || res.status === 403
          ? t("errorAuth")
          : t("errorLoad", { status: res.status })}
      </div>
    );
  }

  const initialFilters = parsePackageFiltersFromSearch(search);

  return (
    <AccountPageFrame title={t("title")} description={t("description")}>
      <Suspense fallback={null}>
        <AdminPackagesManagement
          key={packageFiltersQueryKey(initialFilters)}
          packages={res.data}
          locale={locale}
          initialFilters={initialFilters}
        />
      </Suspense>
    </AccountPageFrame>
  );
}
