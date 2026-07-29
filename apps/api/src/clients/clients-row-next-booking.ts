import { BookingStatus } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';

export type ClientNextBooking = {
  id: string;
  startsAt: string;
  classTypeName: string;
};

type BookingWithSession = {
  id: string;
  status: BookingStatus;
  session: {
    startsAt: Date;
    classType: { name: string };
  };
};

/** Picks the earliest upcoming BOOKED session from an already-loaded booking list. */
export function pickNextBookingFromBookings(
  bookings: readonly BookingWithSession[],
  nowMs: number = Date.now(),
): ClientNextBooking | null {
  let best: BookingWithSession | null = null;
  for (const booking of bookings) {
    if (booking.status !== BookingStatus.BOOKED) {
      continue;
    }
    const startsAtMs = booking.session.startsAt.getTime();
    if (startsAtMs < nowMs) {
      continue;
    }
    if (best === null || startsAtMs < best.session.startsAt.getTime()) {
      best = booking;
    }
  }
  if (best === null) {
    return null;
  }
  return {
    id: best.id,
    startsAt: best.session.startsAt.toISOString(),
    classTypeName: best.session.classType.name,
  };
}

type NextBookingQueryRow = {
  id: string;
  userId: string;
  session: {
    startsAt: Date;
    classType: { name: string };
  };
};

/**
 * Loads each user's earliest upcoming BOOKED booking in one query.
 * Results are keyed by `userId`.
 */
export async function loadNextBookingsByUserId(
  prisma: PrismaService,
  userIds: readonly string[],
  now: Date = new Date(),
): Promise<Map<string, ClientNextBooking>> {
  const result = new Map<string, ClientNextBooking>();
  if (userIds.length === 0) {
    return result;
  }

  const rows = (await prisma.booking.findMany({
    where: {
      userId: { in: [...userIds] },
      status: BookingStatus.BOOKED,
      session: { startsAt: { gte: now } },
    },
    select: {
      id: true,
      userId: true,
      session: {
        select: {
          startsAt: true,
          classType: { select: { name: true } },
        },
      },
    },
    orderBy: { session: { startsAt: 'asc' } },
  })) as NextBookingQueryRow[];

  for (const row of rows) {
    if (result.has(row.userId)) {
      continue;
    }
    result.set(row.userId, {
      id: row.id,
      startsAt: row.session.startsAt.toISOString(),
      classTypeName: row.session.classType.name,
    });
  }

  return result;
}

export function attachNextBookingsToRows<T extends { id: string; nextBooking: ClientNextBooking | null }>(
  rows: T[],
  nextByUserId: ReadonlyMap<string, ClientNextBooking>,
): T[] {
  return rows.map((row) => ({
    ...row,
    nextBooking: nextByUserId.get(row.id) ?? null,
  }));
}
