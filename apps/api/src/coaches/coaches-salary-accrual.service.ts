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
  coach: { salaryPerClassAmd: number };
};

const finishedSessionSelect = {
  id: true,
  status: true,
  startsAt: true,
  coachId: true,
  coach: { select: { salaryPerClassAmd: true } },
  salaryAccrual: { select: { id: true } },
  _count: {
    select: {
      bookings: {
        where: { status: { not: BookingStatus.CANCELLED } },
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

  async accrueMissingFinishedSessions(): Promise<number> {
    const sessions = await this.prisma.classSession.findMany({
      where: {
        status: ClassSessionStatus.FINISHED,
        salaryAccrual: null,
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
    if (
      !shouldAccrueCoachSalary({
        status: session.status,
        bookedParticipantCount: session._count.bookings,
        salaryPerClassAmd: session.coach.salaryPerClassAmd,
      })
    ) {
      return false;
    }
    return this.createAccrual(session);
  }

  private async createAccrual(session: AccrualSession): Promise<boolean> {
    const period = salaryPeriodFromInstant(session.startsAt);
    try {
      await this.prisma.coachSalaryAccrual.create({
        data: {
          coachProfileId: session.coachId,
          classSessionId: session.id,
          amountAmd: session.coach.salaryPerClassAmd,
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
