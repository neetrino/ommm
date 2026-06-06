import { CoachUpcomingSessionsSection } from "@/components/coach/coach-upcoming-sessions-section";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import { redirectToRoleHome } from "@/server/redirect-to-role-home";
import { loadCoachPanelPageData } from "@/server/coach-panel-page-data";

export default async function CoachSchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "coachPages.schedule" });
  const panel = await loadCoachPanelPageData();

  if (!panel.ok) {
    if (panel.reason === "not_signed_in") {
      return (
        <AdminContentFrame>
          <div className="app-alert-warn max-w-xl">{t("signInRequired")}</div>
        </AdminContentFrame>
      );
    }
    if (panel.reason === "not_coach_role" && panel.role) {
      redirectToRoleHome(locale, panel.role);
    }
    return (
      <AdminContentFrame>
        <div className="app-alert-warn max-w-xl">{t("noProfile")}</div>
      </AdminContentFrame>
    );
  }

  return (
    <AdminContentFrame>
      <AdminSectionShell>
        <h2 className={adminChrome.sectionTitle}>{t("sessions")}</h2>
        <CoachUpcomingSessionsSection locale={locale} sessions={panel.sessions} />
      </AdminSectionShell>
    </AdminContentFrame>
  );
}
