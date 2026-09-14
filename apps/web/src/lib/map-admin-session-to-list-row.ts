import type { AdminScheduleSession } from "@/components/admin/admin-schedule-management";
import type { ScheduleSessionListRow } from "@/components/shared/schedule/schedule-session-list-types";

const FALLBACK_ADMIN_COACH: AdminScheduleSession["coach"] = {
  id: "",
  user: { name: null, lastName: null },
};

function sessionDisplayTitle(title: string, classTypeName: string): string {
  const trimmed = title.trim();
  return trimmed.length > 0 ? trimmed : classTypeName;
}

/** Maps admin schedule session rows to shared staff list row shape. */
export function mapAdminScheduleSessionToListRow(
  session: AdminScheduleSession,
): ScheduleSessionListRow {
  return {
    id: session.id,
    title: sessionDisplayTitle(session.title, session.classType.name),
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

/** Maps coach/staff list rows onto the admin schedule view model. */
export function mapListRowToAdminScheduleSession(
  session: ScheduleSessionListRow,
): AdminScheduleSession {
  return {
    id: session.id,
    title: sessionDisplayTitle(session.title, session.classType.name),
    description: null,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    capacity: session.capacity,
    level: session.level,
    classFormat: session.classFormat,
    status: session.status,
    classType: session.classType,
    coach: session.coach
      ? {
          id: session.coach.id,
          user: {
            name: session.coach.user.name,
            lastName: session.coach.user.lastName ?? null,
          },
        }
      : FALLBACK_ADMIN_COACH,
    _count: session._count,
  };
}
