/** Coach dashboard API row shapes (web panel). */

export type CoachPanelSessionRow = {
  id: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  classType: { name: string };
  coachId: string;
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
