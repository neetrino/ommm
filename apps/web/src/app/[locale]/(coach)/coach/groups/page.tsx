import { CoachAttendanceRosterSection } from "@/components/coach/coach-attendance-roster-section";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { redirectToRoleHome } from "@/server/redirect-to-role-home";
import { loadCoachPanelPageData } from "@/server/coach-panel-page-data";

export default async function CoachGroupsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "coachPages.groups" });
  const panel = await loadCoachPanelPageData();

  if (!panel.ok) {
    if (panel.reason === "not_signed_in") {
      return (
        <div className="app-alert-warn max-w-xl">
          {t("signInRequired")}
        </div>
      );
    }
    if (panel.reason === "not_coach_role" && panel.role) {
      redirectToRoleHome(locale, panel.role);
    }
    return (
      <div className="app-alert-warn max-w-xl">
        {t("noProfile")}
      </div>
    );
  }

  return (
    <AccountPageFrame
      title={t("title")}
      description={t("description")}
    >
      <section className={adminChrome.panel}>
        <h2 className={adminChrome.panelHeading}>{t("attendanceBooked")}</h2>
        <p className={adminChrome.metaText}>
          {t("helpText")}
        </p>
        <CoachAttendanceRosterSection locale={locale} roster={panel.roster} />
      </section>
    </AccountPageFrame>
  );
}
