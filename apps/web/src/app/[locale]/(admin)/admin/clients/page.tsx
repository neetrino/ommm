import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminClientsManagement } from "@/components/admin/admin-clients-management";
import {
  buildAdminClientsApiSearchParams,
  pickAdminClientsInitialFilters,
} from "@/components/admin/admin-clients-query";
import type { AdminClientsPayload, PackageOption } from "@/components/admin/admin-clients-types";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { serverApiJson } from "@/lib/server-api";

export default async function AdminClientsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.clients" });
  const cookie = (await headers()).get("cookie") ?? "";
  const apiSearch = buildAdminClientsApiSearchParams(search);
  const endpoint = `/clients?${apiSearch.toString()}`;
  const [clientsRes, packagesRes] = await Promise.all([
    serverApiJson<AdminClientsPayload>(endpoint, cookie),
    serverApiJson<PackageOption[]>("/memberships/admin/plans", cookie),
  ]);

  if (!clientsRes.ok) {
    const status = clientsRes.status;
    return (
      <div className="app-alert-warn max-w-xl">
        {status === 401 || status === 403
          ? t("errorAuth")
          : t("errorLoad", { status })}
      </div>
    );
  }

  if (!packagesRes.ok) {
    const status = packagesRes.status;
    return (
      <div className="app-alert-warn max-w-xl">
        {status === 401 || status === 403
          ? t("errorAuth")
          : t("errorLoad", { status })}
      </div>
    );
  }

  return (
    <AdminContentFrame description={t("description")}>
      <AdminClientsManagement
        initial={clientsRes.data}
        packages={packagesRes.data}
        locale={locale}
        initialFilters={pickAdminClientsInitialFilters(search)}
      />
    </AdminContentFrame>
  );
}
