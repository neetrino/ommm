import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingStatus,
  ClassSessionStatus,
  Prisma,
  Role,
  type User,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimePublisherService } from '../realtime/realtime-publisher.service';
import { ScheduleService } from '../schedule/schedule.service';
import { WaitlistService } from '../waitlist/waitlist.service';
import {
  resolveAttendanceStatus,
  resolveBookingPaymentMethod,
  resolvePaymentStatus,
} from './bookings-management.helpers';
import { BookingsAdminListService } from './bookings-admin-list.service';
import { BookingsSlotService } from './bookings-slot.service';
import type { CreateBookingNoteDto } from './dto/create-booking-note.dto';
import type { UpdateAdminBookingDto } from './dto/update-admin-booking.dto';

@Injectable()
export class BookingsAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminList: BookingsAdminListService,
    private readonly waitlist: WaitlistService,
    private readonly schedule: ScheduleService,
    private readonly realtime: RealtimePublisherService,
    private readonly slots: BookingsSlotService,
  ) {}

  listAdmin(filters: Parameters<BookingsAdminListService['listAdmin']>[0]) {
    return this.adminList.listAdmin(filters);
  }

  async adminCancel(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { session: true },
    });
    if (!booking) {
      throw new NotFoundException();
    }
    await this.slots.releaseSlot(booking);
    await this.schedule.invalidatePublicCache();
    this.realtime.emitBookingSessionChange({
      userId: booking.userId,
      sessionId: booking.sessionId,
    });
    return { ok: true };
  }

  async moveBooking(bookingId: string, targetSessionId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking || booking.status !== BookingStatus.BOOKED) {
      throw new BadRequestException('Invalid booking');
    }
    const target = await this.prisma.classSession.findUnique({
      where: { id: targetSessionId },
    });
    if (!target || target.status === ClassSessionStatus.CANCELLED) {
      throw new NotFoundException('Target session not found');
    }
    const n = await this.waitlist.bookedCount(targetSessionId);
    if (n >= target.capacity) {
      throw new BadRequestException('Target session is full');
    }
    const oldSessionId = booking.sessionId;
    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { sessionId: targetSessionId },
      include: { session: true },
    });
    await this.prisma.classSession.updateMany({
      where: { id: oldSessionId, status: ClassSessionStatus.FULL },
      data: { status: ClassSessionStatus.ACTIVE },
    });
    const oldSession = await this.prisma.classSession.findUnique({
      where: { id: oldSessionId },
    });
    if (oldSession) {
      const oldBooked = await this.waitlist.bookedCount(oldSessionId);
      if (oldBooked < oldSession.capacity) {
        await this.prisma.classSession.update({
          where: { id: oldSessionId },
          data: { status: ClassSessionStatus.ACTIVE },
        });
      }
    }
    const newBooked = await this.waitlist.bookedCount(targetSessionId);
    if (newBooked >= target.capacity) {
      await this.prisma.classSession.update({
        where: { id: targetSessionId },
        data: { status: ClassSessionStatus.FULL },
      });
    }
    await this.waitlist.offerNextIfSlot(oldSessionId);
    await this.schedule.invalidatePublicCache();
    this.realtime.emitBookingSessionChange({
      userId: booking.userId,
      sessionId: targetSessionId,
    });
    if (oldSessionId !== targetSessionId) {
      this.realtime.emitPublicScheduleSession(oldSessionId);
    }
    return updated;
  }

  async markAttended(actor: User, bookingId: string, attended: boolean) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { session: { select: { coachId: true } } },
    });
    if (!booking) {
      throw new NotFoundException();
    }
    if (actor.role === Role.COACH) {
      const profile = await this.prisma.coachProfile.findUnique({
        where: { userId: actor.id },
        select: { id: true },
      });
      if (!profile || booking.session.coachId !== profile.id) {
        throw new ForbiddenException();
      }
    }
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: attended ? BookingStatus.COMPLETED : BookingStatus.MISSED,
        attendedAt: attended ? new Date() : null,
      },
    });
  }

  async addNote(author: User, bookingId: string, dto: CreateBookingNoteDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { session: true },
    });
    if (!booking) {
      throw new NotFoundException();
    }
    if (author.role === Role.COACH) {
      const profile = await this.prisma.coachProfile.findUnique({
        where: { userId: author.id },
      });
      if (!profile || booking.session.coachId !== profile.id) {
        throw new ForbiddenException();
      }
    }
    return this.prisma.bookingNote.create({
      data: {
        bookingId,
        authorId: author.id,
        body: dto.body,
      },
    });
  }

  async adminGetById(actor: User, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            lastName: true,
            phone: true,
          },
        },
        session: {
          include: {
            classType: true,
            coach: { include: { user: { select: { id: true, name: true } } } },
          },
        },
        notes: {
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
      },
    });
    if (!booking) {
      throw new NotFoundException();
    }
    if (actor.role === Role.COACH) {
      const profile = await this.prisma.coachProfile.findUnique({
        where: { userId: actor.id },
        select: { id: true },
      });
      if (!profile || booking.session.coachId !== profile.id) {
        throw new ForbiddenException();
      }
    }
    const payments = await this.prisma.payment.findMany({
      where: { userId: booking.userId },
      select: {
        status: true,
        description: true,
        paymentMethod: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return {
      ...booking,
      paymentStatus: resolvePaymentStatus({ booking, payments }),
      bookingPaymentMethod: resolveBookingPaymentMethod({
        booking,
        payments,
      }),
      attendanceStatus: resolveAttendanceStatus(booking.status),
    };
  }

  async adminUpdate(bookingId: string, dto: UpdateAdminBookingDto) {
    if (dto.targetSessionId && dto.targetSessionId.trim() !== '') {
      await this.moveBooking(bookingId, dto.targetSessionId);
    }
    if (dto.status === BookingStatus.CANCELLED) {
      await this.adminCancel(bookingId);
      return this.prisma.booking.findUnique({
        where: { id: bookingId },
        include: { session: { include: { classType: true } } },
      });
    }
    if (dto.attended !== undefined && dto.status === undefined) {
      return this.prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: dto.attended ? BookingStatus.COMPLETED : BookingStatus.MISSED,
          attendedAt: dto.attended ? new Date() : null,
        },
      });
    }
    if (dto.status === undefined) {
      throw new BadRequestException('No updatable fields were provided');
    }
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: dto.status,
        cancelledAt: null,
        attendedAt: dto.status === BookingStatus.COMPLETED ? new Date() : null,
      },
    });
  }

  async adminDeletePermanent(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, status: true },
    });
    if (!booking) {
      throw new NotFoundException();
    }
    if (booking.status === BookingStatus.BOOKED) {
      throw new BadRequestException(
        'Active bookings cannot be deleted permanently. Cancel first.',
      );
    }
    await this.prisma.booking.delete({ where: { id: bookingId } });
    return { ok: true };
  }
}
