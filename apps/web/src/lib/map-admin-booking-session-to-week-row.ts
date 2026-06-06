import type { AdminBookingSessionSlot } from "@/components/admin/admin-bookings-query";
import type { ScheduleWeekMiniCardSession } from "@/components/shared/schedule/schedule-week-session-mini-card";

export function mapAdminBookingSessionToWeekRow(
  session: AdminBookingSessionSlot,
): ScheduleWeekMiniCardSession {
  return {
    id: session.id,
    title: session.title,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    capacity: session.capacity,
    classType: session.classType,
    _count: { bookings: session.bookedCount },
    coach: {
      id: session.coach.id,
      user: { name: session.coach.name },
    },
  };
}
