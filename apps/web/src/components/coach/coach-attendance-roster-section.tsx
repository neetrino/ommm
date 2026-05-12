import { MarkAttendanceButtons } from "@/components/coach/mark-attendance-buttons";
import { formatSessionRange } from "@/lib/format-session-time";
import type { CoachPanelBookingRow } from "@/lib/coach-panel-types";

type CoachAttendanceRosterSectionProps = {
  locale: string;
  roster: CoachPanelBookingRow[];
};

export function CoachAttendanceRosterSection({
  locale,
  roster,
}: CoachAttendanceRosterSectionProps) {
  if (roster.length === 0) {
    return <p className="mt-2 text-sm text-zinc-600">No active bookings.</p>;
  }

  return (
    <ul className="mt-4 space-y-3">
      {roster.map((b) => (
        <li
          key={b.id}
          className="flex flex-col gap-3 rounded-[24px] border border-indigo-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-medium text-zinc-900">
              {b.user.name ?? b.user.email}
            </p>
            <p className="text-sm text-zinc-600">
              {b.session.classType.name} ·{" "}
              {formatSessionRange(
                locale,
                b.session.startsAt,
                b.session.endsAt,
              )}
            </p>
          </div>
          <MarkAttendanceButtons bookingId={b.id} />
        </li>
      ))}
    </ul>
  );
}
