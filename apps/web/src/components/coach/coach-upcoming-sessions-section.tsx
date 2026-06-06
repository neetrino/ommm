import { getTranslations } from "next-intl/server";
import type { CoachPanelSessionRow } from "@/lib/coach-panel-types";
import { adminChrome } from "@/components/admin/admin-chrome";
import { CoachScheduleSessionRow } from "@/components/coach/coach-schedule-session-row";
import {
  COACH_SCHEDULE_SESSIONS_LIST_EMPHASIZED_HEADER,
  COACH_SCHEDULE_SESSIONS_LIST_HEADER_CLASS,
  COACH_SCHEDULE_SESSIONS_LIST_TABLE_CLASS,
} from "@/components/coach/coach-schedule-sessions-list-layout";

type CoachUpcomingSessionsSectionProps = {
  locale: string;
  sessions: CoachPanelSessionRow[];
};

export async function CoachUpcomingSessionsSection({
  locale,
  sessions,
}: CoachUpcomingSessionsSectionProps) {
  const tEmpty = await getTranslations({
    locale,
    namespace: "coachPages.schedule.upcomingSessions",
  });
  const tCols = await getTranslations({ locale, namespace: "adminPages.classes" });

  if (sessions.length === 0) {
    return <p className={adminChrome.metaText}>{tEmpty("empty")}</p>;
  }

  return (
    <div className={COACH_SCHEDULE_SESSIONS_LIST_TABLE_CLASS}>
      <div className={COACH_SCHEDULE_SESSIONS_LIST_HEADER_CLASS}>
        <span>{tCols("colClass")}</span>
        <span className={COACH_SCHEDULE_SESSIONS_LIST_EMPHASIZED_HEADER}>
          {tCols("colDateTime")}
        </span>
        <span className={COACH_SCHEDULE_SESSIONS_LIST_EMPHASIZED_HEADER}>
          {tCols("colCapacity")}
        </span>
        <span className={COACH_SCHEDULE_SESSIONS_LIST_EMPHASIZED_HEADER}>
          {tCols("colTags")}
        </span>
        <span className={COACH_SCHEDULE_SESSIONS_LIST_EMPHASIZED_HEADER}>
          {tCols("colStatus")}
        </span>
      </div>
      {sessions.map((row) => (
        <CoachScheduleSessionRow key={row.id} locale={locale} row={row} />
      ))}
    </div>
  );
}
