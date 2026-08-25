import { Injectable, Logger } from '@nestjs/common';
import { StaffActivityType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  STAFF_ACTIVITY_HEADER_TAKE,
  STAFF_ACTIVITY_PAGE_TAKE,
} from './staff-activity.constants';
import type { ListStaffActivityQueryDto } from './dto/list-staff-activity-query.dto';
import { toStaffActivityDto } from './staff-activity.mapper';

/** Suppress duplicate rows from payment/confirm retries. */
const STAFF_ACTIVITY_DEDUPE_WINDOW_MS = 30_000;

function formatMemberName(
  name: string | null | undefined,
  lastName: string | null | undefined,
): string {
  return [name?.trim(), lastName?.trim()].filter(Boolean).join(' ').trim();
}

@Injectable()
export class StaffActivityService {
  private readonly logger = new Logger(StaffActivityService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListStaffActivityQueryDto) {
    const take = query.take ?? STAFF_ACTIVITY_PAGE_TAKE;
    const offset = query.offset ?? 0;
    const where = this.buildListWhere(query);
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.staffActivityNotification.count({ where }),
      this.prisma.staffActivityNotification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take,
      }),
    ]);
    return {
      items: rows.map((row) => toStaffActivityDto(row)),
      total,
      take,
      offset,
    };
  }

  private buildListWhere(query: ListStaffActivityQueryDto) {
    const q = query.q?.trim();
    return {
      ...(query.type ? { type: query.type } : {}),
      ...(q
        ? {
            OR: [
              { memberName: { contains: q, mode: 'insensitive' as const } },
              { className: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };
  }

  async listHeader() {
    return this.list({ take: STAFF_ACTIVITY_HEADER_TAKE, offset: 0 });
  }

  async unreadCount() {
    const count = await this.prisma.staffActivityNotification.count({
      where: { staffReadAt: null },
    });
    return { count };
  }

  async markAllRead() {
    await this.prisma.staffActivityNotification.updateMany({
      where: { staffReadAt: null },
      data: { staffReadAt: new Date() },
    });
    return { ok: true as const };
  }

  /** Best-effort write — never fails the booking/cancel path. */
  async recordBookingCreated(bookingId: string): Promise<void> {
    await this.recordFromBooking(StaffActivityType.BOOKING_CREATED, bookingId);
  }

  /** Best-effort write — never fails the booking/cancel path. */
  async recordBookingCancelled(bookingId: string): Promise<void> {
    await this.recordFromBooking(
      StaffActivityType.BOOKING_CANCELLED,
      bookingId,
    );
  }

  private async recordFromBooking(
    type: StaffActivityType,
    bookingId: string,
  ): Promise<void> {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id: bookingId },
        select: {
          id: true,
          userId: true,
          user: { select: { name: true, lastName: true, email: true } },
          session: {
            select: {
              startsAt: true,
              classType: { select: { name: true } },
            },
          },
        },
      });
      if (!booking) {
        this.logger.warn(
          `Staff activity skipped — booking ${bookingId} not found for ${type}`,
        );
        return;
      }
      const dedupeSince = new Date(
        Date.now() - STAFF_ACTIVITY_DEDUPE_WINDOW_MS,
      );
      const recent = await this.prisma.staffActivityNotification.findFirst({
        where: {
          bookingId: booking.id,
          type,
          createdAt: { gte: dedupeSince },
        },
        select: { id: true },
      });
      if (recent) {
        return;
      }
      const memberName =
        formatMemberName(booking.user.name, booking.user.lastName) ||
        booking.user.email;
      await this.prisma.staffActivityNotification.create({
        data: {
          type,
          bookingId: booking.id,
          memberUserId: booking.userId,
          memberName,
          className: booking.session.classType.name,
          sessionStartsAt: booking.session.startsAt,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to record staff activity ${type} for booking ${bookingId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
