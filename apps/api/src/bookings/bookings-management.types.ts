import { BookingChannel, BookingStatus } from '@prisma/client';

export type ManagementBooking = {
  id: string;
  userId: string;
  sessionId: string;
  status: BookingStatus;
  channel: BookingChannel;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
  session: {
    id: string;
    startsAt: Date;
    endsAt: Date;
    classType: { id: string; name: string };
    coach: { id: string; user: { name: string | null } };
  };
  notes: Array<{
    id: string;
    body: string;
    createdAt: Date;
    author: { name: string | null };
  }>;
};

export type ManagementWaitlist = {
  id: string;
  position: number;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
  session: {
    id: string;
    startsAt: Date;
    endsAt: Date;
    classType: { id: string; name: string };
    coach: { id: string; user: { name: string | null } };
  };
};
