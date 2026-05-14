import { getTranslations } from "next-intl/server";
import { formatSessionRange } from "@/lib/format-session-time";
import type { CoachPanelSessionRow } from "@/lib/coach-panel-types";
import { adminChrome } from "@/components/admin/admin-chrome";

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

  if (sessions.length === 0) {
    return <p className={adminChrome.metaText}>{t("empty")}</p>;
  }

  return (
    <ul className="mt-4 space-y-3">
      {sessions.map((s) => (
        <li key={s.id} className={adminChrome.panel}>
          <p className={adminChrome.panelHeading}>{s.classType.name}</p>
          <p className="mt-1 text-sm text-sage-700">
            {formatSessionRange(locale, s.startsAt, s.endsAt)}
          </p>
          <p className={`mt-2 ${adminChrome.metaText}`}>
            {t("bookedCount", { booked: s._count.bookings, capacity: s.capacity })}
          </p>
          <p className={`${adminChrome.metaText} mt-1 uppercase tracking-wide`}>
            {t("sessionId", { id: s.id })}
          </p>
        </li>
      ))}
    </ul>
  );
}
