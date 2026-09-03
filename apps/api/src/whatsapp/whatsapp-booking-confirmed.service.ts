import { Injectable, Logger } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { WhatsappNotifyService } from './whatsapp-notify.service';
import { renderBookingConfirmedWhatsapp } from './whatsapp-schedule-templates';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WhatsappBookingConfirmedService {
  private readonly logger = new Logger(WhatsappBookingConfirmedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notify: WhatsappNotifyService,
  ) {}

  async tryNotify(bookingId: string): Promise<void> {
    try {
      await this.notifyIfNeeded(bookingId);
    } catch (error) {
      this.logger.error(
        `WhatsApp booking confirmed failed for ${bookingId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async notifyIfNeeded(bookingId: string): Promise<void> {
    const already = await this.prisma.bookingConfirmedSendLog.findUnique({
      where: { bookingId },
      select: { sentAt: true },
    });
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true,
        guestPassSlot: true,
        updatedAt: true,
        user: { select: { id: true, locale: true } },
        session: {
          select: {
            startsAt: true,
            classType: { select: { name: true } },
          },
        },
      },
    });
    if (
      !booking ||
      booking.status !== BookingStatus.BOOKED ||
      booking.guestPassSlot !== 0
    ) {
      return;
    }
    if (already !== null && already.sentAt >= booking.updatedAt) {
      return;
    }
    const result = await this.notify.trySendToUser({
      userId: booking.user.id,
      topic: 'bookingReminders',
      render: (locale) => renderBookingConfirmedWhatsapp(locale),
    });
    if (result === 'failed') {
      return;
    }
    await this.prisma.bookingConfirmedSendLog.upsert({
      where: { bookingId: booking.id },
      create: { bookingId: booking.id },
      update: { sentAt: new Date() },
    });
  }
}
