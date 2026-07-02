import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingStatus,
  ClassSessionStatus,
  Role,
  WaitlistStatus,
} from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import { resolveWaitlistAdminOrderBy } from '../common/list-order.helpers';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimePublisherService } from '../realtime/realtime-publisher.service';
import { ScheduleService } from '../schedule/schedule.service';
import { AdminWaitlistActiveQueryDto } from './dto/admin-waitlist-active-query.dto';
import { WaitlistCapacityService } from './waitlist-capacity.service';

@Injectable()
export class WaitlistAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly audit: AuditService,
    private readonly realtime: RealtimePublisherService,
    private readonly schedule: ScheduleService,
    private readonly capacity: WaitlistCapacityService,
  ) {}

  listAdminRecent(take: number) {
    const safeTake = Math.min(Math.max(take, 1), 500);
    return this.prisma.waitlistEntry.findMany({
      orderBy: { updatedAt: 'desc' },
      take: safeTake,
      include: {
        user: { select: { id: true, name: true, email: true } },
        session: { include: { classType: true } },
      },
    });
  }

  async listAdminActive(query: AdminWaitlistActiveQueryDto = {}) {
    const hasPagination =
      query.take !== undefined || query.offset !== undefined;
    const activeStatuses = [WaitlistStatus.ACTIVE, WaitlistStatus.OFFERED];
    const where = { status: { in: activeStatuses } };
    const orderBy = resolveWaitlistAdminOrderBy(query.order);
    const include = {
      user: {
        select: {
          id: true,
          name: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      session: {
        select: {
          id: true,
          startsAt: true,
          classType: {
            select: { id: true, name: true },
          },
        },
      },
    };

    if (!hasPagination) {
      const take = Math.min(Math.max(query.take ?? 200, 1), 500);
      const entries = await this.prisma.waitlistEntry.findMany({
        where,
        orderBy,
        take,
        include,
      });
      return this.mapAdminActiveEntries(entries);
    }

    const take = query.take ?? DEFAULT_LIST_PAGE_SIZE;
    const offset = query.offset ?? 0;
    const [entries, total] = await Promise.all([
      this.prisma.waitlistEntry.findMany({
        where,
        orderBy,
        take,
        skip: offset,
        include,
      }),
      this.prisma.waitlistEntry.count({ where }),
    ]);
    const items = await this.mapAdminActiveEntries(entries);
    return { items, total, take, offset };
  }

  async remove(entryId: string) {
    await this.prisma.waitlistEntry.update({
      where: { id: entryId },
      data: { status: WaitlistStatus.REMOVED },
    });
    return { ok: true };
  }

  async promoteToBooking(entryId: string, targetSessionId: string) {
    const entry = await this.prisma.waitlistEntry.findUnique({
      where: { id: entryId },
      include: { session: true },
    });
    if (!entry) {
      throw new NotFoundException('Waitlist entry not found');
    }
    if (entry.sessionId !== targetSessionId) {
      throw new BadRequestException(
        'targetSessionId does not match entry session',
      );
    }
    if (
      entry.status !== WaitlistStatus.ACTIVE &&
      entry.status !== WaitlistStatus.OFFERED
    ) {
      throw new ConflictException(
        'Only active or offered entries can be promoted',
      );
    }
    const session = entry.session;
    if (!session || session.status === ClassSessionStatus.CANCELLED) {
      throw new NotFoundException('Session not found');
    }
    const booked = await this.capacity.bookedCount(session.id);
    if (booked >= session.capacity) {
      throw new ForbiddenException('Session is full');
    }
    const existingBooking = await this.prisma.booking.findUnique({
      where: {
        userId_sessionId: { userId: entry.userId, sessionId: session.id },
      },
    });
    if (existingBooking && existingBooking.status === BookingStatus.BOOKED) {
      throw new ConflictException(
        'User already has an active booking for this session',
      );
    }
    const result = await this.prisma.$transaction(async (tx) => {
      const booking =
        existingBooking == null
          ? await tx.booking.create({
              data: {
                userId: entry.userId,
                sessionId: session.id,
                status: BookingStatus.BOOKED,
              },
            })
          : await tx.booking.update({
              where: { id: existingBooking.id },
              data: {
                status: BookingStatus.BOOKED,
                cancelledAt: null,
                attendedAt: null,
              },
            });
      await tx.waitlistEntry.update({
        where: { id: entry.id },
        data: { status: WaitlistStatus.CONVERTED },
      });
      return booking;
    });
    const after = await this.capacity.bookedCount(session.id);
    if (after >= session.capacity) {
      await this.prisma.classSession.updateMany({
        where: { id: session.id, status: ClassSessionStatus.ACTIVE },
        data: { status: ClassSessionStatus.FULL },
      });
    }
    await this.audit.log({
      action: 'WAITLIST_PROMOTED',
      entityType: 'WaitlistEntry',
      entityId: entry.id,
      payload: { bookingId: result.id, sessionId: session.id },
    });
    await this.schedule.invalidatePublicCache();
    this.realtime.emitBookingSessionChange({
      userId: entry.userId,
      sessionId: session.id,
    });
    this.realtime.emitWaitlistChanged(entry.userId, session.id);
    return result;
  }

  async manualNotify(
    entryId: string,
    payload: {
      subject?: string;
      message?: string;
      actorName?: string | null;
      actorId?: string;
      actorRole?: Role;
    },
  ) {
    const entry = await this.prisma.waitlistEntry.findUnique({
      where: { id: entryId },
      include: {
        user: true,
        session: { include: { classType: true } },
      },
    });
    if (!entry) {
      throw new NotFoundException('Waitlist entry not found');
    }
    const subject =
      payload.subject?.trim() ||
      `Waitlist update: ${entry.session.classType.name}`;
    const actor = payload.actorName?.trim();
    const note = payload.message?.trim();
    const html = [
      `<p>Your waitlist status for <strong>${entry.session.classType.name}</strong> was updated.</p>`,
      note ? `<p>${note}</p>` : '',
      actor ? `<p>Sent by: ${actor}</p>` : '',
    ]
      .filter(Boolean)
      .join('');
    await this.mail.sendEmail({
      to: entry.user.email,
      subject,
      html,
    });
    await this.audit.log({
      actorId: payload.actorId ?? null,
      actorRole: payload.actorRole ?? null,
      action: 'WAITLIST_MANUAL_NOTIFICATION',
      entityType: 'WaitlistEntry',
      entityId: entry.id,
      payload: {
        subject,
      },
    });
    return { ok: true };
  }

  private async mapAdminActiveEntries(
    entries: {
      id: string;
      status: WaitlistStatus;
      createdAt: Date;
      offeredAt: Date | null;
      offerExpiresAt: Date | null;
      sessionId: string;
      user: {
        id: string;
        name: string | null;
        lastName: string | null;
        email: string;
        phone: string | null;
      };
      session: {
        id: string;
        startsAt: Date;
        classType: { id: string; name: string };
      };
    }[],
  ) {
    if (entries.length === 0) {
      return [];
    }
    const activeStatuses = [WaitlistStatus.ACTIVE, WaitlistStatus.OFFERED];
    const sessionIds = [...new Set(entries.map((entry) => entry.sessionId))];
    const counts = await this.prisma.waitlistEntry.groupBy({
      by: ['sessionId'],
      where: {
        sessionId: { in: sessionIds },
        status: { in: activeStatuses },
      },
      _count: {
        _all: true,
      },
    });
    const countBySessionId = new Map(
      counts.map((item) => [item.sessionId, item._count._all]),
    );
    return entries.map((entry) => ({
      id: entry.id,
      status: entry.status,
      waitlistDate: entry.createdAt,
      offeredAt: entry.offeredAt,
      offerExpiresAt: entry.offerExpiresAt,
      sessionWaitlistCount: countBySessionId.get(entry.sessionId) ?? 0,
      user: {
        id: entry.user.id,
        name: entry.user.name,
        lastName: entry.user.lastName,
        email: entry.user.email,
        phone: entry.user.phone,
      },
      session: {
        id: entry.session.id,
        startsAt: entry.session.startsAt,
        classType: {
          id: entry.session.classType.id,
          name: entry.session.classType.name,
        },
      },
    }));
  }
}
