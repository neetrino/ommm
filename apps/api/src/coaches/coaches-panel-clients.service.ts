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

/** Booking history for clients who booked this coach. */
@Injectable()
export class CoachesPanelClientsService {
  constructor(private readonly prisma: PrismaService) {}

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
