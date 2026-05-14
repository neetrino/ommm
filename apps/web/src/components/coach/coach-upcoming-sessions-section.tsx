import { formatSessionRange } from "@/lib/format-session-time";
import type { CoachPanelSessionRow } from "@/lib/coach-panel-types";
import { adminChrome } from "@/components/admin/admin-chrome";

type CoachUpcomingSessionsSectionProps = {
  locale: string;
  sessions: CoachPanelSessionRow[];
};

export function CoachUpcomingSessionsSection({
  locale,
  sessions,
}: CoachUpcomingSessionsSectionProps) {
  if (sessions.length === 0) {
    return <p className={adminChrome.metaText}>No sessions in range.</p>;
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
            {s._count.bookings}/{s.capacity} booked
          </p>
          <p className={`${adminChrome.metaText} mt-1 uppercase tracking-wide`}>
            Session ID: {s.id}
          </p>
        </li>
      ))}
    </ul>
  );
}
