import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminPackagesManagement } from "@/components/admin/admin-packages-management";
import type { AdminPackageRow } from "@/components/admin/admin-packages-types";
import { serverApiJson } from "@/lib/server-api";

export default async function AdminPackagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "adminPages.packages" });
  const cookie = (await headers()).get("cookie") ?? "";
  const packagesRes = await serverApiJson<AdminPackageRow[]>("/packages/admin/plans", cookie);

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

  return (
    <AdminContentFrame description={t("description")}>
      <Suspense fallback={null}>
        <AdminPackagesManagement packages={packagesRes.data} locale={locale} />
      </Suspense>
    </AdminContentFrame>
  );
}
