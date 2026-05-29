import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminClientsManagement } from "@/components/admin/admin-clients-management";
import type {
  AdminClientsPayload,
  MembershipPlanOption,
} from "@/components/admin/admin-clients-types";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
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
  const apiSearch = new URLSearchParams();
  apiSearch.set("meta", "true");
  for (const [key, value] of Object.entries(search)) {
    if (value) {
      apiSearch.set(key, value);
    }
  }
  const endpoint = `/clients?${apiSearch.toString()}`;
  const [clientsRes, plansRes] = await Promise.all([
    serverApiJson<AdminClientsPayload>(endpoint, cookie),
    serverApiJson<MembershipPlanOption[]>("/memberships/admin/plans", cookie),
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

  if (!plansRes.ok) {
    const status = plansRes.status;
    return (
      <div className="app-alert-warn max-w-xl">
        {status === 401 || status === 403
          ? t("errorAuth")
          : t("errorLoad", { status })}
      </div>
    );
  }

  return (
    <AccountPageFrame
      title={t("title")}
      description={t("description")}
    >
      <AdminClientsManagement
        initial={clientsRes.data}
        plans={plansRes.data}
        locale={locale}
        initialFilters={Object.fromEntries(
          Object.entries(search).filter((entry): entry is [string, string] => Boolean(entry[1])),
        )}
      />
    </AccountPageFrame>
  );
}
