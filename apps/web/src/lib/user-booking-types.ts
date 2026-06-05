export type UserBookingRow = {
  id: string;
  status: string;
  session: {
    id: string;
    startsAt: string;
    endsAt: string;
    classType: { name: string };
  };
};

export type UserWaitlistRow = {
  id: string;
  position: number;
  status: string;
  session: {
    startsAt: string;
    endsAt: string;
    classType: { name: string };
  };
};

export type UserSessionRow = {
  id: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  priceCents: number;
  status: string;
  classType: { name: string };
  coach: { user: { name: string | null } };
  _count: { bookings: number };
};
