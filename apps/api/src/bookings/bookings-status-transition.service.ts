import { Injectable, Logger } from '@nestjs/common';
import { BookingStatus, ClassSessionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CoachSalaryAccrualService } from '../coaches/coaches-salary-accrual.service';
import { ENABLE_BOOKING_BACKGROUND_JOBS_ENV } from './bookings.constants';

@Injectable()
export class BookingsStatusTransitionService {
  private readonly logger = new Logger(BookingsStatusTransitionService.name);
  private readonly cronEnabled: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly salaryAccrual: CoachSalaryAccrualService,
  ) {
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

  /**
   * Marks past ACTIVE/FULL class sessions as FINISHED once endsAt has passed.
   * CANCELLED sessions stay CANCELLED. Eligible finished sessions accrue salary.
   */
  async finishPastClassSessions(now: Date = new Date()): Promise<number> {
    const sessions = await this.prisma.classSession.findMany({
      where: {
        endsAt: { lte: now },
        status: {
          in: [ClassSessionStatus.ACTIVE, ClassSessionStatus.FULL],
        },
      },
      select: { id: true },
    });
    if (sessions.length === 0) {
      return 0;
    }
    const ids = sessions.map((session) => session.id);
    const result = await this.prisma.classSession.updateMany({
      where: { id: { in: ids } },
      data: { status: ClassSessionStatus.FINISHED },
    });
    await this.salaryAccrual.accrueFinishedSessions(ids);
    return result.count;
  }

  async onSessionFinished(sessionId: string): Promise<void> {
    await this.salaryAccrual.accrueFinishedSession(sessionId);
  }

  /** Invoked by CronBatchService (every 30 min). */
  async completePastBookedSessionsCron(): Promise<void> {
    if (!this.cronEnabled) {
      return;
    }
    const bookingCount = await this.completePastBookedSessions();
    const sessionCount = await this.finishPastClassSessions();
    const backfillCount =
      await this.salaryAccrual.accrueMissingFinishedSessions();
    if (bookingCount > 0) {
      this.logger.log(`Auto-completed ${bookingCount} past booking(s).`);
    }
    if (sessionCount > 0) {
      this.logger.log(
        `Marked ${sessionCount} past class session(s) as finished.`,
      );
    }
    if (backfillCount > 0) {
      this.logger.log(
        `Accrued coach salary for ${backfillCount} finished class(es).`,
      );
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
