import { Injectable } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { resolveSalaryMonthRange } from './coaches-salary-list-filters';
import {
  mapSalarySessionRow,
  type CoachSalarySessionRow,
} from './coaches-salary-sessions.helpers';
import type { CoachSalarySessionsQueryDto } from './dto/coach-salary-sessions-query.dto';

export type CoachSalarySessionsPage = {
  items: CoachSalarySessionRow[];
  total: number;
  take: number;
  offset: number;
};

const sessionSelect = {
  id: true,
  startsAt: true,
  endsAt: true,
  status: true,
  capacity: true,
  classTypeId: true,
  classType: { select: { id: true, name: true } },
  salaryAccrual: { select: { amountAmd: true } },
  bookings: {
    where: { status: { not: BookingStatus.CANCELLED } },
    select: { status: true },
  },
} as const;

/** Feeds the admin "why is this coach's salary this amount" breakdown drawer. */
@Injectable()
export class CoachSalarySessionsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Resolves the coach's own profile from their user id — for the coach panel endpoint. */
  async listForUser(
    userId: string,
    query: CoachSalarySessionsQueryDto,
  ): Promise<CoachSalarySessionsPage | null> {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      return null;
    }
    return this.listForCoach(profile.id, query);
  }

  async listForCoach(
    coachProfileId: string,
    query: CoachSalarySessionsQueryDto,
  ): Promise<CoachSalarySessionsPage> {
    const { from, to } = resolveSalaryMonthRange(query.month);
    const take = query.take ?? DEFAULT_LIST_PAGE_SIZE;
    const offset = query.offset ?? 0;
    const where = {
      coachId: coachProfileId,
      startsAt: { gte: from, lt: to },
    };

    const [sessions, total, rate] = await Promise.all([
      this.prisma.classSession.findMany({
        where,
        select: sessionSelect,
        orderBy: { startsAt: 'asc' as const },
        take,
        skip: offset,
      }),
      this.prisma.classSession.count({ where }),
      this.prisma.coachClassTypeRate.findMany({
        where: { coachProfileId },
        select: { classTypeId: true, amountAmd: true },
      }),
    ]);

    const rateByClassType = new Map(
      rate.map((row) => [row.classTypeId, row.amountAmd]),
    );
    const items = sessions.map((session) =>
      mapSalarySessionRow(
        session,
        rateByClassType.get(session.classTypeId) ?? 0,
      ),
    );
    return { items, total, take, offset };
  }
}
