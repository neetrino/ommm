import { BadRequestException, Injectable } from '@nestjs/common';
import { BookingStatus, type Prisma } from '@prisma/client';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  COACH_SALARY_EXPORT_MAX_ROWS,
  COACH_SALARY_EXPORT_TOO_MANY_ROWS,
} from './coaches-salary-export.constants';
import { formatCoachExportName } from './coaches-salary-export-rows';
import { resolveSalaryStartsAtFilter } from './coaches-salary-list-filters';
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

export type CoachSalaryExportData = {
  coachName: string;
  from: string;
  to: string;
  items: CoachSalarySessionRow[];
};

type SalarySessionWhere = {
  coachId: string;
  startsAt: Prisma.DateTimeFilter;
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
    const take = query.take ?? DEFAULT_LIST_PAGE_SIZE;
    const offset = query.offset ?? 0;
    const where = this.sessionWhere(coachProfileId, query);
    const [items, total] = await Promise.all([
      this.loadMappedSessions(coachProfileId, where, take, offset),
      this.prisma.classSession.count({ where }),
    ]);
    return { items, total, take, offset };
  }

  /** Every session in the inclusive range, for the salary workbook. */
  async listForExport(
    coachProfileId: string,
    query: { from: string; to: string },
  ): Promise<CoachSalaryExportData | null> {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { id: coachProfileId },
      select: { user: { select: { name: true, lastName: true } } },
    });
    if (!profile) {
      return null;
    }
    const items = await this.loadExportItems(coachProfileId, query);
    return {
      coachName: formatCoachExportName(profile.user),
      from: query.from,
      to: query.to,
      items,
    };
  }

  private sessionWhere(
    coachProfileId: string,
    query: { month?: string; from?: string; to?: string },
  ): SalarySessionWhere {
    return {
      coachId: coachProfileId,
      startsAt: resolveSalaryStartsAtFilter(query),
    };
  }

  private async loadExportItems(
    coachProfileId: string,
    query: { from: string; to: string },
  ): Promise<CoachSalarySessionRow[]> {
    const where = this.sessionWhere(coachProfileId, query);
    const total = await this.prisma.classSession.count({ where });
    if (total > COACH_SALARY_EXPORT_MAX_ROWS) {
      throw new BadRequestException(COACH_SALARY_EXPORT_TOO_MANY_ROWS);
    }
    if (total === 0) {
      return [];
    }
    return this.loadMappedSessions(coachProfileId, where, total, 0);
  }

  private async loadMappedSessions(
    coachProfileId: string,
    where: SalarySessionWhere,
    take: number,
    offset: number,
  ): Promise<CoachSalarySessionRow[]> {
    const [sessions, rates] = await Promise.all([
      this.prisma.classSession.findMany({
        where,
        select: sessionSelect,
        orderBy: { startsAt: 'asc' },
        take,
        skip: offset,
      }),
      this.prisma.coachClassTypeRate.findMany({
        where: { coachProfileId },
        select: { classTypeId: true, amountAmd: true },
      }),
    ]);
    const rateByClassType = new Map(
      rates.map((row) => [row.classTypeId, row.amountAmd]),
    );
    return sessions.map((session) =>
      mapSalarySessionRow(
        session,
        rateByClassType.get(session.classTypeId) ?? 0,
      ),
    );
  }
}
