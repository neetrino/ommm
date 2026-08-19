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
import {
  buildMemberWaitlistsUrl,
  resolveEmailLocale,
  resolveWebAppUrl,
} from '../mail/email-app-urls';
import { MailService } from '../mail/mail.service';
import {
  renderWaitlistUpdateEmail,
  resolveWaitlistUpdateSubject,
} from '../mail/templates/waitlist-emails.template';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimePublisherService } from '../realtime/realtime-publisher.service';
import { ScheduleService } from '../schedule/schedule.service';
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
    const className = entry.session.classType.name;
    const subject = resolveWaitlistUpdateSubject(payload.subject, className);
    await this.mail.sendEmail({
      to: entry.user.email,
      subject,
      html: renderWaitlistUpdateEmail({
        className,
        message: payload.message?.trim() ?? '',
        waitlistsUrl: buildMemberWaitlistsUrl(
          resolveWebAppUrl(process.env.WEB_APP_URL),
          resolveEmailLocale(entry.user.locale ?? undefined),
        ),
      }),
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
}
