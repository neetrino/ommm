import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminClientsManagement } from "@/components/admin/admin-clients-management";
import {
  buildAdminClientsApiSearchParams,
  pickAdminClientsInitialFilters,
} from "@/components/admin/admin-clients-query";
import type { AdminClientsPayload } from "@/components/admin/admin-clients-types";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { serverApiJson } from "@/lib/server-api";

export default async function ManagerClientsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.clients" });
  const tManager = await getTranslations({ locale, namespace: "managerPages.clients" });
  const cookie = (await headers()).get("cookie") ?? "";
  const apiSearch = buildAdminClientsApiSearchParams(search);
  const endpoint = `/clients?${apiSearch.toString()}`;
  const clientsRes = await serverApiJson<AdminClientsPayload>(endpoint, cookie);

  if (!clientsRes.ok) {
    return (
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">
          {clientsRes.status === 401 || clientsRes.status === 403
            ? t("errorAuth")
            : t("errorLoad", { status: clientsRes.status })}
        </div>
      </AdminContentFrame>
    );
  }

  return (
    <AdminContentFrame>
      <AdminClientsManagement
        initial={clientsRes.data}
        locale={locale}
        initialFilters={pickAdminClientsInitialFilters(search)}
        variant="staff"
        staffBanner={tManager("readOnlyHint")}
        readOnly
      />
    </AdminContentFrame>
  );
}
