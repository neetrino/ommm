import type { AdminScheduleSession } from "@/components/admin/admin-schedule-management";
import type { ScheduleSessionListRow } from "@/components/shared/schedule/schedule-session-list-types";

/** Maps admin schedule session rows to shared staff list row shape. */
export function mapAdminScheduleSessionToListRow(
  session: AdminScheduleSession,
): ScheduleSessionListRow {
  const title = session.title.trim();
  return {
    id: session.id,
    title: title.length > 0 ? title : session.classType.name,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    capacity: session.capacity,
    level: session.level,
    classFormat: session.classFormat,
    status: session.status,
    classType: session.classType,
    coach: session.coach,
    _count: session._count,
  };
}
