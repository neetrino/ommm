import { getTranslations } from "next-intl/server";
import type { CoachPanelSessionRow } from "@/lib/coach-panel-types";
import { StaffScheduleSessionsList } from "@/components/shared/schedule/staff-schedule-sessions-list";

type CoachUpcomingSessionsSectionProps = {
  locale: string;
  sessions: CoachPanelSessionRow[];
};

export async function CoachUpcomingSessionsSection({
  locale,
  sessions,
}: CoachUpcomingSessionsSectionProps) {
  const t = await getTranslations({
    locale,
    namespace: "coachPages.schedule.upcomingSessions",
  });

  return (
    <StaffScheduleSessionsList
      locale={locale}
      sessions={sessions}
      emptyMessage={t("empty")}
    />
  );
}
