import type { ScheduleWeekMiniCardSession } from "@/components/shared/schedule/schedule-week-session-mini-card";
import type { UserSessionRow } from "@/lib/user-booking-types";

export function mapUserSessionToWeekRow(session: UserSessionRow): ScheduleWeekMiniCardSession {
  return {
    id: session.id,
    title: session.classType.name,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    capacity: session.capacity,
    classType: session.classType,
    _count: session._count,
    coach: {
      id: session.id,
      user: session.coach.user,
    },
  };
}
