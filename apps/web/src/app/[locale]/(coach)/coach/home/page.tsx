import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { adminChrome } from "@/components/admin/admin-chrome";
import { AccountPageFrame } from "@/components/layout/account-page-frame";
import { redirectToRoleHome } from "@/server/redirect-to-role-home";
import { loadCoachPanelPageData } from "@/server/coach-panel-page-data";

function isSameLocalCalendarDay(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

export default async function CoachHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "coachPages.home" });
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

  const { sessions, roster, userName } = panel;
  const today = new Date();
  const todaysSessions = sessions.filter((s) =>
    isSameLocalCalendarDay(s.startsAt, today),
  );
  const todaysRoster = roster.filter((b) =>
    isSameLocalCalendarDay(b.session.startsAt, today),
  );

  const linkClass =
    "ommm-cta-primary inline-flex text-sm";

  return (
    <AccountPageFrame
      title={t("title", { name: userName ?? "" })}
      description={t("description")}
    >
      <section>
        <h2 className={adminChrome.sectionTitle}>{t("todayAtGlance")}</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className={adminChrome.metricCard}>
            <dt className={adminChrome.metricLabel}>{t("classesToday")}</dt>
            <dd className={adminChrome.metricValue}>{todaysSessions.length}</dd>
          </div>
          <div className={adminChrome.metricCard}>
            <dt className={adminChrome.metricLabel}>{t("bookedClientsToday")}</dt>
            <dd className={adminChrome.metricValue}>{todaysRoster.length}</dd>
          </div>
          <div className={adminChrome.metricCard}>
            <dt className={adminChrome.metricLabel}>
              {t("upcomingSessionsRange")}
            </dt>
            <dd className={adminChrome.metricValue}>{sessions.length}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-8 flex flex-wrap gap-3">
        <Link href="/coach/schedule" className={linkClass}>
          {t("openSchedule")}
        </Link>
        <Link href="/coach/groups" className={linkClass}>
          {t("viewParticipantsAttendance")}
        </Link>
      </section>
    </AccountPageFrame>
  );
}
