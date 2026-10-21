import { getTranslations } from "next-intl/server";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { CoachClientsSection } from "@/components/coach/coach-clients-section";
import type { CoachPanelClientsPayload } from "@/components/coach/coach-clients-types";
import { serverApiJson } from "@/lib/server-api";
import { redirectToRoleHome } from "@/server/redirect-to-role-home";
import { getSessionAuth } from "@/server/require-role-layout";

export default async function CoachClientsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
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

  const clientsRes = await serverApiJson<CoachPanelClientsPayload>(
    "/coaches/panel/clients",
    session.cookie,
  );
  if (!clientsRes.ok) {
    const message =
      clientsRes.status === 404 ? t("noProfile") : t("loadFailed");
    return <CoachClientsAlert message={message} />;
  }

  return (
    <AdminContentFrame>
      <CoachClientsSection locale={locale} clients={clientsRes.data.items} />
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
