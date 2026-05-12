import { formatSessionRange } from "@/lib/format-session-time";
import type { CoachPanelSessionRow } from "@/lib/coach-panel-types";

type CoachUpcomingSessionsSectionProps = {
  locale: string;
  sessions: CoachPanelSessionRow[];
};

export function CoachUpcomingSessionsSection({
  locale,
  sessions,
}: CoachUpcomingSessionsSectionProps) {
  if (sessions.length === 0) {
    return <p className="mt-2 text-sm text-zinc-600">No sessions in range.</p>;
  }

  return (
    <ul className="mt-4 space-y-3">
      {sessions.map((s) => (
        <li
          key={s.id}
          className="rounded-[24px] border border-indigo-100 bg-white p-4 text-sm shadow-sm"
        >
          <p className="font-medium text-zinc-900">{s.classType.name}</p>
          <p className="text-zinc-600">
            {formatSessionRange(locale, s.startsAt, s.endsAt)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {s._count.bookings}/{s.capacity} booked
          </p>
        </li>
      ))}
    </ul>
  );
}
