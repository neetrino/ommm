import { Injectable, Logger } from '@nestjs/common';
import { BookingStatus, ClassSessionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { COACH_SALARY_ACCRUAL_BATCH_LIMIT } from './coaches-salary.constants';
import {
  salaryPeriodFromInstant,
  shouldAccrueCoachSalary,
} from './coaches-salary.helpers';

type AccrualSession = {
  id: string;
  startsAt: Date;
  coachId: string;
  classTypeId: string;
};

const finishedSessionSelect = {
  id: true,
  status: true,
  startsAt: true,
  coachId: true,
  classTypeId: true,
  salaryAccrual: { select: { id: true } },
  _count: {
    select: {
      /** Only COMPLETED bookings count as attendance — see {@link isAttendedBookingStatus}. */
      bookings: {
        where: { status: BookingStatus.COMPLETED },
      },
    },
  },
} as const;

@Injectable()
export class CoachSalaryAccrualService {
  private readonly logger = new Logger(CoachSalaryAccrualService.name);

  constructor(private readonly prisma: PrismaService) {}

  async accrueFinishedSessions(sessionIds: readonly string[]): Promise<number> {
    let created = 0;
    for (const sessionId of sessionIds) {
      try {
        if (await this.accrueFinishedSession(sessionId)) {
          created += 1;
        }
      } catch (error) {
        this.logger.error(
          `Coach salary accrual failed for session ${sessionId}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
    return created;
  }

  /**
   * Repairs finished classes left without a salary line — e.g. the class ended
   * before the coach rate existed, or attendance was marked after the fact.
   * Scoped to one coach when `coachProfileId` is given.
   */
  async accrueMissingFinishedSessions(
    coachProfileId?: string,
  ): Promise<number> {
    const sessions = await this.prisma.classSession.findMany({
      where: {
        status: ClassSessionStatus.FINISHED,
        salaryAccrual: null,
        ...(coachProfileId !== undefined && { coachId: coachProfileId }),
      },
      select: { id: true },
      orderBy: { endsAt: 'asc' },
      take: COACH_SALARY_ACCRUAL_BATCH_LIMIT,
    });
    return this.accrueFinishedSessions(sessions.map((session) => session.id));
  }

  async accrueFinishedSession(sessionId: string): Promise<boolean> {
    const session = await this.prisma.classSession.findUnique({
      where: { id: sessionId },
      select: finishedSessionSelect,
    });
    if (!session || session.salaryAccrual) {
      return false;
    }
    const amountAmd = await this.resolveSessionRateAmd(
      session.coachId,
      session.classTypeId,
    );
    if (
      !shouldAccrueCoachSalary({
        status: session.status,
        attendedParticipantCount: session._count.bookings,
        salaryPerClassAmd: amountAmd,
      })
    ) {
      return false;
    }
    return this.createAccrual(session, amountAmd);
  }

  private async resolveSessionRateAmd(
    coachProfileId: string,
    classTypeId: string,
  ): Promise<number> {
    const rate = await this.prisma.coachClassTypeRate.findUnique({
      where: {
        coachProfileId_classTypeId: { coachProfileId, classTypeId },
      },
      select: { amountAmd: true },
    });
    return rate?.amountAmd ?? 0;
  }

  private async createAccrual(
    session: AccrualSession,
    amountAmd: number,
  ): Promise<boolean> {
    const period = salaryPeriodFromInstant(session.startsAt);
    try {
      await this.prisma.coachSalaryAccrual.create({
        data: {
          coachProfileId: session.coachId,
          classSessionId: session.id,
          amountAmd,
          periodYear: period.year,
          periodMonth: period.month,
        },
      });
      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return false;
      }
      throw error;
    }
  }
}
