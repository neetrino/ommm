import { Suspense } from "react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminCallTasksManagement } from "@/components/admin/admin-call-tasks-management";
import {
  buildCallTasksListEndpoint,
  firstQueryValue,
  parseCallTaskListStatus,
  type CallTaskListPayload,
} from "@/components/admin/admin-call-tasks-query";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { parseListPageParams } from "@/lib/list-pagination";
import { serverApiJson } from "@/lib/server-api";

export default async function AdminCallsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "adminPages.calls" });
  const cookie = (await headers()).get("cookie") ?? "";
  const listPage = parseListPageParams(search);
  const status = parseCallTaskListStatus(firstQueryValue(search.status));
  const q = firstQueryValue(search.q) ?? "";
  const endpoint = buildCallTasksListEndpoint({
    take: listPage.take,
    offset: listPage.offset,
    q,
    status,
  });
  const response = await serverApiJson<CallTaskListPayload>(endpoint, cookie);
  const initialPayload = response.ok
    ? response.data
    : { items: [], total: 0, take: listPage.take, offset: listPage.offset };
  const initialLoadError = response.ok
    ? null
    : response.status === 401 || response.status === 403
      ? t("errorAuth")
      : t("errorLoad", { status: response.status });

  return (
    <AdminContentFrame>
      <Suspense fallback={null}>
        <AdminCallTasksManagement
          initial={initialPayload}
          initialLoadError={initialLoadError}
        />
      </Suspense>
    </AdminContentFrame>
  );
}
