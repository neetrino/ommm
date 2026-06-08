import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminBookingsManagement } from "@/components/admin/admin-bookings-management";
import {
  buildAdminBookingsListEndpoint,
  resolveManagerBookingsInitialFilters,
  type AdminBookingsManagementPayload,
} from "@/components/admin/admin-bookings-query";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { parseListPageParams } from "@/lib/list-pagination";
import { serverApiJson } from "@/lib/server-api";

export default async function ManagerBookingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.bookings" });
  const tManager = await getTranslations({ locale, namespace: "managerPages.bookings" });
  const cookie = (await headers()).get("cookie") ?? "";
  const initialFilters = resolveManagerBookingsInitialFilters(search);
  const listPage = parseListPageParams(search);
  const endpoint = buildAdminBookingsListEndpoint(initialFilters, listPage);
  const res = await serverApiJson<AdminBookingsManagementPayload>(endpoint, cookie);

  if (!res.ok) {
    return (
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">
          {res.status === 401 || res.status === 403
            ? t("errorAuth")
            : t("errorLoad", { status: res.status })}
        </div>
      </AdminContentFrame>
    );
  }

  const bookingsOnly = res.data.rows.filter((row) => row.recordType === "BOOKING");

  return (
    <AdminContentFrame>
      <AdminBookingsManagement
        locale={locale}
        initial={{
          ...res.data,
          rows: bookingsOnly,
        }}
        initialFilters={initialFilters}
        variant="staff"
        staffBanner={tManager("rollingWindowHint")}
      />
    </AdminContentFrame>
  );
}
