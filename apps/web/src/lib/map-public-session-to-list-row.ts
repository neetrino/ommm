import type {
  ScheduleSessionListRow,
  ScheduleSessionListStatus,
} from "@/components/shared/schedule/schedule-session-list-types";

/** Row shape from `GET /classes/sessions` (public list). */
export type PublicClassSessionRow = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  level: string | null;
  classFormat: string | null;
  status: string;
  classType: { id: string; name: string };
  coach: {
    id: string;
    user: { name: string | null; lastName?: string | null; email?: string };
  };
  _count: { bookings: number };
};

export function mapPublicSessionToScheduleListRow(
  session: PublicClassSessionRow,
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
    status: session.status as ScheduleSessionListStatus,
    classType: session.classType,
    coach: session.coach,
    _count: session._count,
  };
}
