import { MarkAttendanceButtons } from "@/components/coach/mark-attendance-buttons";
import { formatSessionRange } from "@/lib/format-session-time";
import type { CoachPanelBookingRow } from "@/lib/coach-panel-types";
import { adminChrome } from "@/components/admin/admin-chrome";

type CoachAttendanceRosterSectionProps = {
  locale: string;
  roster: CoachPanelBookingRow[];
};

export function CoachAttendanceRosterSection({
  locale,
  roster,
}: CoachAttendanceRosterSectionProps) {
  if (roster.length === 0) {
    return <p className={adminChrome.metaText}>No active bookings.</p>;
  }

  return (
    <ul className="mt-4 space-y-3">
      {roster.map((b) => (
        <li
          key={b.id}
          className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${adminChrome.panel}`}
        >
          <div>
            <p className={adminChrome.panelHeading}>
              {b.user.name ?? b.user.email}
            </p>
            <p className="mt-1 text-sm text-sage-700">
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
