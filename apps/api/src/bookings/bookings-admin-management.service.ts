import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  ClassSessionStatus,
  Prisma,
  Role,
  WaitlistStatus,
  type User,
} from '@prisma/client';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import { BookingManagementOrder } from '../common/enums/list-order.enum';
import { sortBookingManagementRows } from '../common/list-order.helpers';
import { PrismaService } from '../prisma/prisma.service';
import { buildScopedSessionFilter } from './bookings-management.helpers';
import {
  mapManagementBookingRow,
  mapManagementWaitlistRow,
  summarizeManagementRows,
} from './bookings-management.mapper';
import type {
  ManagementBooking,
  ManagementWaitlist,
} from './bookings-management.types';
import type { AdminBookingsManagementQueryDto } from './dto/admin-bookings-management-query.dto';

@Injectable()
export class BookingsAdminManagementService {
  constructor(private readonly prisma: PrismaService) {}

  listAdmin(filters: {
    actor: User;
    sessionId?: string;
    userId?: string;
    from?: Date;
    to?: Date;
  }) {
    const coachScope =
      filters.actor.role === Role.COACH
        ? ({
            coach: { userId: filters.actor.id },
          } as Prisma.ClassSessionWhereInput)
        : undefined;
    const sessionFilter: Prisma.ClassSessionWhereInput | undefined =
      filters.from && filters.to
        ? {
            startsAt: { gte: filters.from, lte: filters.to },
            ...(coachScope ?? {}),
          }
        : coachScope;
    return this.prisma.booking.findMany({
      where: {
        ...(filters.sessionId && { sessionId: filters.sessionId }),
        ...(filters.userId && { userId: filters.userId }),
        ...(sessionFilter && { session: sessionFilter }),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        session: {
          include: {
            classType: true,
            coach: { include: { user: { select: { id: true, name: true } } } },
          },
        },
        notes: { include: { author: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  async listAdminManagement(params: {
    actor: User;
    query: AdminBookingsManagementQueryDto;
  }) {
    const sessionFilter = buildScopedSessionFilter({
      actor: params.actor,
      from: params.query.from,
      to: params.query.to,
      classTypeId: params.query.classTypeId,
      coachId: params.query.coachId,
    });
    const q = params.query.q?.trim();
    const userSearch: Prisma.UserWhereInput | undefined =
      q && q.length > 0
        ? {
            OR: [
              { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
              { email: { contains: q, mode: Prisma.QueryMode.insensitive } },
              { phone: { contains: q, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : undefined;

    const bookingWhere: Prisma.BookingWhereInput = {
      ...(params.query.status ? { status: params.query.status } : {}),
      ...(params.query.channel ? { channel: params.query.channel } : {}),
      ...(params.query.userId ? { userId: params.query.userId } : {}),
      ...(sessionFilter ? { session: sessionFilter } : {}),
      ...(userSearch ? { user: userSearch } : {}),
    };

    if (params.query.countOnly) {
      const matchedTotal = await this.prisma.booking.count({
        where: bookingWhere,
      });
      return {
        rows: [],
        sessionSlots: [],
        filterOptions: { classTypes: [], coaches: [] },
        summary: {
          total: matchedTotal,
          booked: 0,
          completed: 0,
          cancelled: 0,
          waitlisted: 0,
          today: 0,
        },
        pagination: { total: matchedTotal, take: 0, offset: 0 },
      };
    }

    const adminSessionStatuses: ClassSessionStatus[] = [
      ClassSessionStatus.DRAFT,
      ClassSessionStatus.ACTIVE,
      ClassSessionStatus.FULL,
    ];

    const [bookingsRaw, waitlistsRaw, classTypes, coaches, sessionsRaw] =
      await Promise.all([
        this.prisma.booking.findMany({
          where: bookingWhere,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            session: {
              include: {
                classType: true,
                coach: {
                  include: { user: { select: { id: true, name: true } } },
                },
              },
            },
            notes: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: { author: { select: { id: true, name: true } } },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 1000,
        }),
        this.prisma.waitlistEntry.findMany({
          where: {
            status: { in: [WaitlistStatus.ACTIVE, WaitlistStatus.OFFERED] },
            ...(params.query.userId ? { userId: params.query.userId } : {}),
            ...(sessionFilter ? { session: sessionFilter } : {}),
            ...(userSearch ? { user: userSearch } : {}),
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            session: {
              include: {
                classType: true,
                coach: {
                  include: { user: { select: { id: true, name: true } } },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 500,
        }),
        this.prisma.classType.findMany({
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        }),
        this.prisma.coachProfile.findMany({
          select: { id: true, user: { select: { id: true, name: true } } },
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.classSession.findMany({
          where: {
            ...(sessionFilter ?? {}),
            status: { in: adminSessionStatuses },
          },
          include: {
            classType: { select: { id: true, name: true } },
            coach: {
              include: { user: { select: { id: true, name: true } } },
            },
            _count: {
              select: {
                bookings: { where: { status: BookingStatus.BOOKED } },
              },
            },
          },
          orderBy: { startsAt: 'asc' },
          take: 1000,
        }),
      ]);

    const bookings = bookingsRaw as ManagementBooking[];
    const waitlists = waitlistsRaw as ManagementWaitlist[];

    const userIds = Array.from(
      new Set([
        ...bookings.map((row) => row.userId),
        ...waitlists.map((row) => row.user.id),
      ]),
    );
    const payments = userIds.length
      ? await this.prisma.payment.findMany({
          where: { userId: { in: userIds } },
          select: {
            id: true,
            userId: true,
            status: true,
            description: true,
            paymentMethod: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5000,
        })
      : [];

    const paymentByUser = new Map<string, typeof payments>();
    for (const row of payments) {
      const current = paymentByUser.get(row.userId) ?? [];
      current.push(row);
      paymentByUser.set(row.userId, current);
    }

    const bookingRows = bookings.map((booking) =>
      mapManagementBookingRow(
        booking,
        paymentByUser.get(booking.userId) ?? [],
      ),
    );
    const waitlistRows = waitlists.map((row) => mapManagementWaitlistRow(row));

    let rows = [...bookingRows, ...waitlistRows];
    if (params.query.paymentStatus) {
      rows = rows.filter(
        (row) =>
          row.paymentStatus.toUpperCase() ===
          params.query.paymentStatus?.toUpperCase(),
      );
    }
    if (params.query.attendanceStatus) {
      rows = rows.filter(
        (row) =>
          (row.attendanceStatus ?? '').toUpperCase() ===
          params.query.attendanceStatus?.toUpperCase(),
      );
    }

    rows = sortBookingManagementRows(
      rows,
      params.query.order ?? BookingManagementOrder.UPCOMING,
    );

    const summary = summarizeManagementRows(rows);

    const paginate =
      params.query.take !== undefined || params.query.offset !== undefined;
    const take = params.query.take ?? DEFAULT_LIST_PAGE_SIZE;
    const offset = params.query.offset ?? 0;
    const pagedRows = paginate ? rows.slice(offset, offset + take) : rows;

    const sessionSlots = sessionsRaw.map((session) => {
      const bookedCount = session._count.bookings;
      const spotsLeft = Math.max(session.capacity - bookedCount, 0);
      const status =
        session.status === ClassSessionStatus.ACTIVE &&
        bookedCount >= session.capacity
          ? ClassSessionStatus.FULL
          : session.status;
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

    return {
      rows: pagedRows,
      sessionSlots,
      filterOptions: {
        classTypes,
        coaches: coaches.map((coach) => ({
          id: coach.id,
          name: coach.user.name ?? coach.user.id,
        })),
      },
      summary,
      ...(paginate
        ? {
            pagination: {
              total: summary.total,
              take,
              offset,
            },
          }
        : {}),
    };
  }
}
