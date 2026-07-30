import { Injectable, Logger } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ENABLE_BOOKING_BACKGROUND_JOBS_ENV } from './bookings.constants';

@Injectable()
export class BookingsStatusTransitionService {
  private readonly logger = new Logger(BookingsStatusTransitionService.name);
  private readonly cronEnabled: boolean;

  constructor(private readonly prisma: PrismaService) {
    this.cronEnabled = isEnabledEnv(
      process.env[ENABLE_BOOKING_BACKGROUND_JOBS_ENV],
    );
  }

  /** Marks past BOOKED sessions as COMPLETED once the class end time has passed. */
  async completePastBookedSessions(now: Date = new Date()): Promise<number> {
    const result = await this.prisma.booking.updateMany({
      where: {
        status: BookingStatus.BOOKED,
        session: { endsAt: { lte: now } },
      },
      data: {
        status: BookingStatus.COMPLETED,
        attendedAt: now,
      },
    });
    return result.count;
  }

  /** Invoked by CronBatchService (every 30 min). */
  async completePastBookedSessionsCron(): Promise<void> {
    if (!this.cronEnabled) {
      return;
    }
    const count = await this.completePastBookedSessions();
    if (count > 0) {
      this.logger.log(`Auto-completed ${count} past booking(s).`);
    }
  }
}

function isEnabledEnv(raw: string | undefined): boolean {
  if (!raw) {
    return false;
  }
  const normalized = raw.trim().toLowerCase();
  return normalized === '1' || normalized === 'true';
}
