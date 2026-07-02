import { Injectable } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import { SessionListOrder } from '../common/enums/list-order.enum';
import { resolveBookingSessionOrderBy } from '../common/list-order.helpers';
import { PrismaService } from '../prisma/prisma.service';
import {
  ListMyBookingsQueryDto,
  MyBookingsScope,
} from './dto/list-my-bookings-query.dto';

const listMineInclude = {
  session: {
    include: {
      classType: true,
      coach: { include: { user: { select: { name: true } } } },
    },
  },
} satisfies Prisma.BookingInclude;

@Injectable()
export class BookingsClientListService {
  constructor(private readonly prisma: PrismaService) {}

  listMine(userId: string, query: ListMyBookingsQueryDto = {}) {
    if (!query.scope) {
      return this.listMineAll(userId);
    }
    if (query.scope === MyBookingsScope.UPCOMING) {
      return this.listMineUpcoming(userId, query.order);
    }
    return this.listMinePast(userId, query);
  }

  private listMineAll(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: listMineInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  private listMineUpcoming(userId: string, order?: SessionListOrder) {
    const sessionOrder = resolveBookingSessionOrderBy(order);
    return this.prisma.booking.findMany({
      where: {
        userId,
        status: BookingStatus.BOOKED,
        session: { startsAt: { gt: new Date() } },
      },
      include: listMineInclude,
      orderBy: sessionOrder,
    });
  }

  private async listMinePast(userId: string, query: ListMyBookingsQueryDto) {
    const take = query.take ?? DEFAULT_LIST_PAGE_SIZE;
    const offset = query.offset ?? 0;
    const now = new Date();
    const sessionOrder = resolveBookingSessionOrderBy(query.order);
    const where: Prisma.BookingWhereInput = {
      userId,
      OR: [
        { status: { not: BookingStatus.BOOKED } },
        { session: { startsAt: { lte: now } } },
      ],
    };
    const [rows, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: listMineInclude,
        orderBy: sessionOrder,
        take,
        skip: offset,
      }),
      this.prisma.booking.count({ where }),
    ]);
    return { rows, total, take, offset };
  }
}
