import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { AdminClientsPageView } from "@/components/admin/admin-clients-page-view";
import {
  buildAdminClientsApiSearchParams,
  pickAdminClientsInitialFilters,
} from "@/components/admin/admin-clients-query";
import type { AdminClientsPayload } from "@/components/admin/admin-clients-types";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { serverApiJson } from "@/lib/server-api";
import { redirectToRoleHome } from "@/server/redirect-to-role-home";
import { getSessionAuth } from "@/server/require-role-layout";

const COACH_CLIENTS_PATH = "/clients/coach-panel";

export default async function CoachClientsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "coachPages.clients" });
  const session = await getSessionAuth();

  if (!session.ok) {
    return <CoachClientsAlert message={t("signInRequired")} />;
  }
  if (session.user.role !== "COACH") {
    redirectToRoleHome(locale, session.user.role);
  }
  if (session.coachProfileId === null || session.coachProfileId.length === 0) {
    return <CoachClientsAlert message={t("noProfile")} />;
  }

  const cookie = (await headers()).get("cookie") ?? session.cookie;
  const apiSearch = buildAdminClientsApiSearchParams(search);
  const clientsRes = await serverApiJson<AdminClientsPayload>(
    `${COACH_CLIENTS_PATH}?${apiSearch.toString()}`,
    cookie,
  );
  if (!clientsRes.ok) {
    const message = clientsRes.status === 404 ? t("noProfile") : t("loadFailed");
    return <CoachClientsAlert message={message} />;
  }

  return (
    <AdminContentFrame>
      <AdminClientsPageView
        initial={clientsRes.data}
        locale={locale}
        initialFilters={pickAdminClientsInitialFilters(search)}
        readOnly
        listPath={COACH_CLIENTS_PATH}
        detailPath={COACH_CLIENTS_PATH}
        bookingsOnly
      />
    </AdminContentFrame>
  );
}

function CoachClientsAlert({ message }: { message: string }) {
  return (
    <AdminContentFrame>
      <div className="app-alert-warn max-w-xl">{message}</div>
    </AdminContentFrame>
  );
}
