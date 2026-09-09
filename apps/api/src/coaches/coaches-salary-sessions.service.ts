import { Injectable } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { resolveSalaryMonthRange } from './coaches-salary-list-filters';
import {
  mapSalarySessionRow,
  type CoachSalarySessionRow,
} from './coaches-salary-sessions.helpers';
import type { AdminCoachSalarySessionsQueryDto } from './dto/admin-coach-salary-sessions-query.dto';

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

  async listForCoach(
    coachProfileId: string,
    query: AdminCoachSalarySessionsQueryDto,
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
