import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminManagersDirectory } from "@/components/admin/admin-managers-directory";
import {
  buildAdminManagersListEndpoint,
  parseAdminManagersPageParams,
  pickAdminManagersFilters,
} from "@/components/admin/admin-managers-query";
import { AdminManagersShell } from "@/components/admin/admin-managers-shell";
import type { AdminManagersListPayload } from "@/components/admin/admin-managers-types";
import { serverApiJson } from "@/lib/server-api";

export default async function AdminManagersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.managers" });
  const cookie = (await headers()).get("cookie") ?? "";
  const filters = pickAdminManagersFilters(search);
  const listPage = parseAdminManagersPageParams(search);
  const endpoint = buildAdminManagersListEndpoint(
    filters,
    listPage.take,
    listPage.offset,
  );
  const res = await serverApiJson<AdminManagersListPayload>(endpoint, cookie);

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
    <AdminContentFrame>
      <Suspense fallback={null}>
        <AdminManagersShell filterInitialValues={filters}>
          <AdminManagersDirectory initial={res.data} />
        </AdminManagersShell>
      </Suspense>
    </AdminContentFrame>
  );
}
