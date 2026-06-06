/** Coach dashboard API row shapes (web panel). */

export type CoachPanelSessionStatus = "ACTIVE" | "CANCELLED" | "FULL" | "DRAFT";

export type CoachPanelSessionRow = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  level: string | null;
  classFormat: string | null;
  status: CoachPanelSessionStatus;
  classType: { id: string; name: string };
  coachId: string;
  coach: { id: string; user: { name: string | null } };
  _count: { bookings: number };
};

export type CoachPanelBookingRow = {
  id: string;
  status: string;
  user: { name: string | null; email: string };
  session: {
    id: string;
    startsAt: string;
    endsAt: string;
    coachId: string;
    classType: { name: string };
  };
};
