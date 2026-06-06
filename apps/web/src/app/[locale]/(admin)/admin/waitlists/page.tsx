import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  buildAdminWaitlistActiveEndpoint,
  parseAdminWaitlistPageParams,
  type AdminWaitlistActivePayload,
} from "@/components/admin/admin-waitlist-query";
import { AdminWaitlistManagement } from "@/components/admin/admin-waitlist-management";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { serverApiJson } from "@/lib/server-api";

export default async function AdminWaitlistsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.waitlists" });
  const cookie = (await headers()).get("cookie") ?? "";
  const listPage = parseAdminWaitlistPageParams(search);
  const endpoint = buildAdminWaitlistActiveEndpoint(listPage.take, listPage.offset);
  const response = await serverApiJson<AdminWaitlistActivePayload>(endpoint, cookie);
  const initialPayload = response.ok
    ? response.data
    : { items: [], total: 0, take: listPage.take, offset: listPage.offset };
  const initialLoadError = response.ok
    ? null
    : response.status === 401 || response.status === 403
      ? t("errorAuth")
      : t("errorLoad", { status: response.status });

  return (
    <AdminContentFrame description={t("description")}>
      <Suspense fallback={null}>
        <AdminWaitlistManagement
          locale={locale}
          initial={initialPayload}
          initialLoadError={initialLoadError}
        />
      </Suspense>
    </AdminContentFrame>
  );
}
