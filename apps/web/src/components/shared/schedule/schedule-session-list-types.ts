/** Shared row shape for staff schedule session lists (admin, coach, manager). */

export type ScheduleSessionListStatus = "ACTIVE" | "CANCELLED" | "FULL" | "DRAFT";

export type ScheduleSessionListRow = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  level: string | null;
  classFormat: string | null;
  status: ScheduleSessionListStatus;
  classType: { id: string; name: string };
  coach?: {
    id: string;
    user: { name: string | null; lastName?: string | null; email?: string };
  };
  _count: { bookings: number };
};
