import { BookingStatus, ClassSessionStatus } from '@prisma/client';
import { resolveAdminSessionStatus } from '../classes/classes-session.helpers';
import {
  resolveAttendanceStatus,
  resolveBookingPaymentMethod,
  resolvePaymentStatus,
} from './bookings-management.helpers';
import type {
  ManagementBooking,
  ManagementWaitlist,
} from './bookings-management.types';

type UserPaymentRow = {
  status: Parameters<typeof resolvePaymentStatus>[0]['payments'][0]['status'];
  description: string | null;
  paymentMethod: Parameters<
    typeof resolveBookingPaymentMethod
  >[0]['payments'][0]['paymentMethod'];
};

export function mapManagementBookingRow(
  booking: ManagementBooking,
  userPayments: UserPaymentRow[],
) {
  const paymentStatus = resolvePaymentStatus({
    booking,
    payments: userPayments,
  });
  const bookingPaymentMethod = resolveBookingPaymentMethod({
    booking,
    payments: userPayments,
  });
  return {
    id: booking.id,
    recordType: 'BOOKING' as const,
    status: booking.status,
    attendanceStatus: resolveAttendanceStatus(booking.status),
    paymentStatus,
    bookingPaymentMethod,
    channel: booking.channel,
    registerDate: booking.createdAt.toISOString(),
    user: {
      id: booking.user.id,
      name: booking.user.name,
      email: booking.user.email,
      phone: booking.user.phone,
    },
    session: {
      id: booking.session.id,
      startsAt: booking.session.startsAt.toISOString(),
      endsAt: booking.session.endsAt.toISOString(),
      classType: {
        id: booking.session.classType.id,
        name: booking.session.classType.name,
      },
      coach: {
        id: booking.session.coach.id,
        name: booking.session.coach.user.name,
      },
    },
    package: null,
    latestNote:
      booking.notes[0] === undefined
        ? null
        : {
            id: booking.notes[0].id,
            body: booking.notes[0].body,
            authorName: booking.notes[0].author.name,
            createdAt: booking.notes[0].createdAt.toISOString(),
          },
  };
}

export function mapManagementWaitlistRow(row: ManagementWaitlist) {
  return {
    id: row.id,
    recordType: 'WAITLIST' as const,
    status: 'WAITLISTED' as const,
    attendanceStatus: null,
    paymentStatus: 'UNPAID' as const,
    bookingPaymentMethod: null,
    channel: 'WEBSITE' as const,
    registerDate: row.createdAt.toISOString(),
    user: {
      id: row.user.id,
      name: row.user.name,
      email: row.user.email,
      phone: row.user.phone,
    },
    session: {
      id: row.session.id,
      startsAt: row.session.startsAt.toISOString(),
      endsAt: row.session.endsAt.toISOString(),
      classType: {
        id: row.session.classType.id,
        name: row.session.classType.name,
      },
      coach: {
        id: row.session.coach.id,
        name: row.session.coach.user.name,
      },
    },
    package: null,
    latestNote: null,
    waitlistPosition: row.position,
  };
}

export function mapManagementSessionSlots(
  sessions: Array<{
    id: string;
    title: string | null;
    status: ClassSessionStatus;
    startsAt: Date;
    endsAt: Date;
    capacity: number;
    level: string | null;
    classFormat: string | null;
    classType: { id: string; name: string };
    coach: { id: string; user: { name: string | null } };
    _count: { bookings: number };
  }>,
) {
  return sessions.map((session) => {
    const bookedCount = session._count.bookings;
    const spotsLeft = Math.max(session.capacity - bookedCount, 0);
    const status = resolveAdminSessionStatus({
      status: session.status,
      endsAt: session.endsAt,
      bookedCount,
      capacity: session.capacity,
    });
    return {
      id: session.id,
      title: session.title,
      status,
      startsAt: session.startsAt.toISOString(),
      endsAt: session.endsAt.toISOString(),
      capacity: session.capacity,
      bookedCount,
      spotsLeft,
      level: session.level,
      classFormat: session.classFormat,
      classType: {
        id: session.classType.id,
        name: session.classType.name,
      },
      coach: {
        id: session.coach.id,
        name: session.coach.user.name,
      },
    };
  });
}

export function summarizeManagementRows(
  rows: Array<{
    status: BookingStatus | 'WAITLISTED';
    session: { startsAt: string };
  }>,
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    total: rows.length,
    booked: rows.filter((row) => row.status === BookingStatus.BOOKED).length,
    completed: rows.filter((row) => row.status === BookingStatus.COMPLETED)
      .length,
    cancelled: rows.filter((row) => row.status === BookingStatus.CANCELLED)
      .length,
    waitlisted: rows.filter((row) => row.status === 'WAITLISTED').length,
    today: rows.filter((row) => {
      const starts = new Date(row.session.startsAt);
      return starts >= today && starts < tomorrow;
    }).length,
  };
}
