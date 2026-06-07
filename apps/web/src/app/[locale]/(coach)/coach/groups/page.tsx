import { CoachGroupsSection } from "@/components/coach/coach-groups-section";
import { getTranslations } from "next-intl/server";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { redirectToRoleHome } from "@/server/redirect-to-role-home";
import { loadCoachPanelPageData } from "@/server/coach-panel-page-data";

export default async function CoachGroupsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "coachPages.groups" });
  const panel = await loadCoachPanelPageData("roster");

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
      <CoachGroupsSection locale={locale} roster={panel.roster} />
    </AdminContentFrame>
  );
}
