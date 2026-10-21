import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  SessionListOrder,
  sortRowsBySessionStartsAt,
} from '../common/list-order.helpers';
import { PrismaService } from '../prisma/prisma.service';

const bookingInclude = Prisma.validator<Prisma.BookingInclude>()({
  session: {
    include: {
      classType: { select: { name: true } },
      coach: {
        include: { user: { select: { name: true, lastName: true } } },
      },
    },
  },
});

type BookingRow = Prisma.BookingGetPayload<{ include: typeof bookingInclude }>;

type ClientListRow = {
  id: string;
  name: string | null;
  lastName: string | null;
  bookings: Array<{ session: { startsAt: Date } }>;
  _count: { bookings: number };
};

export type CoachPanelClientItem = {
  id: string;
  name: string | null;
  lastName: string | null;
  bookingCount: number;
  lastSessionAt: string | null;
};

export type CoachPanelClientsPage = {
  items: CoachPanelClientItem[];
};

export type CoachPanelClientBookingItem = {
  id: string;
  status: string;
  channel: string;
  attendedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  guestName: string | null;
  guestPassSlot: number;
  session: {
    startsAt: Date;
    level: string | null;
    classType: { name: string };
    coach: { user: { name: string | null; lastName: string | null } };
  };
};

export type CoachPanelClientBookingsPage = {
  items: CoachPanelClientBookingItem[];
  total: number;
  take: number;
  offset: number;
};

/** Clients who booked this coach, and those bookings only. */
@Injectable()
export class CoachesPanelClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string): Promise<CoachPanelClientsPage> {
    const coachId = await this.requireCoachId(userId);
    const rows = await this.prisma.user.findMany({
      where: clientWhere(coachId),
      select: clientSelect(coachId),
      orderBy: [{ name: 'asc' }, { lastName: 'asc' }],
    });
    return { items: rows.map(mapClient).sort(compareClients) };
  }

  async listBookingsForUser(
    userId: string,
    clientId: string,
    take: number,
    offset: number,
  ): Promise<CoachPanelClientBookingsPage> {
    const coachId = await this.requireCoachId(userId);
    const where = bookingWhere(coachId, clientId);
    const total = await this.prisma.booking.count({ where });
    if (total === 0) {
      throw new NotFoundException();
    }
    const rows = await this.prisma.booking.findMany({
      where,
      include: bookingInclude,
    });
    const sorted = sortRowsBySessionStartsAt(rows, SessionListOrder.DATE_DESC);
    return {
      items: sorted.slice(offset, offset + take).map(mapBooking),
      total,
      take,
      offset,
    };
  }

  private async requireCoachId(userId: string): Promise<string> {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw new NotFoundException();
    }
    return profile.id;
  }
}

function clientWhere(coachId: string): Prisma.UserWhereInput {
  return {
    deletedAt: null,
    bookings: { some: { session: { coachId } } },
  };
}

function clientSelect(coachId: string) {
  return {
    id: true,
    name: true,
    lastName: true,
    bookings: {
      where: { session: { coachId } },
      orderBy: { session: { startsAt: 'desc' as const } },
      take: 1,
      select: { session: { select: { startsAt: true } } },
    },
    _count: {
      select: { bookings: { where: { session: { coachId } } } },
    },
  };
}

function bookingWhere(
  coachId: string,
  clientId: string,
): Prisma.BookingWhereInput {
  return {
    userId: clientId,
    user: { deletedAt: null },
    session: { coachId },
  };
}

function mapClient(row: ClientListRow): CoachPanelClientItem {
  const startsAt = row.bookings[0]?.session.startsAt ?? null;
  return {
    id: row.id,
    name: row.name,
    lastName: row.lastName,
    bookingCount: row._count.bookings,
    lastSessionAt: startsAt === null ? null : startsAt.toISOString(),
  };
}

function compareClients(
  left: CoachPanelClientItem,
  right: CoachPanelClientItem,
): number {
  return sortLabel(left).localeCompare(sortLabel(right), undefined, {
    sensitivity: 'base',
  });
}

function sortLabel(client: CoachPanelClientItem): string {
  return [client.name, client.lastName]
    .filter((part) => part !== null && part.trim().length > 0)
    .join(' ');
}

function mapBooking(row: BookingRow): CoachPanelClientBookingItem {
  return {
    id: row.id,
    status: row.status,
    channel: row.channel,
    attendedAt: row.attendedAt,
    cancelledAt: row.cancelledAt,
    createdAt: row.createdAt,
    guestName: row.guestName,
    guestPassSlot: row.guestPassSlot,
    session: {
      startsAt: row.session.startsAt,
      level: row.session.level,
      classType: { name: row.session.classType.name },
      coach: {
        user: {
          name: row.session.coach.user.name,
          lastName: row.session.coach.user.lastName,
        },
      },
    },
  };
}
