import { Suspense } from "react";
import { CoachScheduleSection } from "@/components/coach/coach-schedule-section";
import { resolveScheduleView } from "@/components/admin/admin-schedule-view";
import { getTranslations } from "next-intl/server";
import { AdminContentFrame } from "@/components/admin/admin-content-frame";
import { redirectToRoleHome } from "@/server/redirect-to-role-home";
import { loadCoachPanelPageData } from "@/server/coach-panel-page-data";

export default async function CoachSchedulePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const initialView = resolveScheduleView(search.view);
  const t = await getTranslations({ locale, namespace: "coachPages.schedule" });
  const panel = await loadCoachPanelPageData("sessions");

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
      <Suspense fallback={null}>
        <CoachScheduleSection
          locale={locale}
          sessions={panel.sessions}
          initialView={initialView}
        />
      </Suspense>
    </AdminContentFrame>
  );
}
