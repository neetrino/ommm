import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminBookingsManagement } from "@/components/admin/admin-bookings-management";
import {
  buildAdminBookingsListEndpoint,
  pickAdminBookingsInitialFilters,
  type AdminBookingsManagementPayload,
} from "@/components/admin/admin-bookings-query";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { parseListPageParams } from "@/lib/list-pagination";
import { serverApiJson } from "@/lib/server-api";

export default async function AdminBookingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.bookings" });
  const cookie = (await headers()).get("cookie") ?? "";
  const initialFilters = pickAdminBookingsInitialFilters(search);
  const listPage = parseListPageParams(search);
  const endpoint = buildAdminBookingsListEndpoint(initialFilters, listPage);
  const res = await serverApiJson<AdminBookingsManagementPayload>(endpoint, cookie);

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
      <AdminBookingsManagement
        locale={locale}
        initial={res.data}
        initialFilters={initialFilters}
      />
    </AdminContentFrame>
  );
}
