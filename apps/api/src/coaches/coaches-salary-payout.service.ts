import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma, User } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import {
  buildTokenAndWhere,
  containsInsensitive,
} from '../common/token-text-search';
import { PrismaService } from '../prisma/prisma.service';
import { parseSalaryMonthParam } from './coaches-salary.helpers';
import type { AdminSalaryPayoutsQueryDto } from './dto/admin-salary-payouts-query.dto';
import {
  CoachSalarySummaryService,
  type CoachSalarySummary,
} from './coaches-salary-summary.service';

export type AdminSalaryPayoutListItem = {
  id: string;
  coachProfileId: string;
  amountAmd: number;
  periodYear: number;
  periodMonth: number;
  paidAt: Date;
  coach: {
    userId: string;
    name: string | null;
    lastName: string | null;
    phone: string | null;
    email: string;
  };
};

export type AdminSalaryPayoutListResult = {
  items: AdminSalaryPayoutListItem[];
  total: number;
  totalPaidCents: number;
  take: number;
  offset: number;
};

@Injectable()
export class CoachSalaryPayoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly summary: CoachSalarySummaryService,
  ) {}

  async listAdmin(
    query: AdminSalaryPayoutsQueryDto = {},
  ): Promise<AdminSalaryPayoutListResult> {
    const take = query.take ?? DEFAULT_LIST_PAGE_SIZE;
    const offset = query.offset ?? 0;
    const where = this.buildListWhere(query);
    const [rows, total, paidAgg] = await Promise.all([
      this.prisma.coachSalaryPayout.findMany({
        where,
        include: {
          coachProfile: {
            select: {
              userId: true,
              user: {
                select: {
                  name: true,
                  lastName: true,
                  phone: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: [{ paidAt: 'desc' }, { id: 'desc' }],
        take,
        skip: offset,
      }),
      this.prisma.coachSalaryPayout.count({ where }),
      this.prisma.coachSalaryPayout.aggregate({
        where,
        _sum: { amountAmd: true },
      }),
    ]);

    return {
      items: rows.map((row) => ({
        id: row.id,
        coachProfileId: row.coachProfileId,
        amountAmd: row.amountAmd,
        periodYear: row.periodYear,
        periodMonth: row.periodMonth,
        paidAt: row.paidAt,
        coach: {
          userId: row.coachProfile.userId,
          name: row.coachProfile.user.name,
          lastName: row.coachProfile.user.lastName,
          phone: row.coachProfile.user.phone,
          email: row.coachProfile.user.email,
        },
      })),
      total,
      totalPaidCents: paidAgg._sum.amountAmd ?? 0,
      take,
      offset,
    };
  }

  async markMonthPaid(
    actor: User,
    coachProfileId: string,
    month: string,
  ): Promise<CoachSalarySummary> {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { id: coachProfileId },
      select: { id: true },
    });
    if (!profile) {
      throw new NotFoundException('Coach profile not found');
    }
    const current = await this.summary.forProfile(profile.id, month);
    if (current.pendingPayoutCents <= 0) {
      throw new BadRequestException('No unpaid salary for this month');
    }
    const period = parseSalaryMonthParam(month);
    await this.prisma.coachSalaryPayout.create({
      data: {
        coachProfileId: profile.id,
        amountAmd: current.pendingPayoutCents,
        periodYear: period.year,
        periodMonth: period.month,
        paidByAdminId: actor.id,
      },
    });
    await this.audit.log({
      actorId: actor.id,
      actorRole: actor.role,
      action: 'COACH_SALARY_PAID',
      entityType: 'CoachProfile',
      entityId: coachProfileId,
      payload: { month, amountAmd: current.pendingPayoutCents },
    });
    return this.summary.forProfile(profile.id, month);
  }

  private buildListWhere(
    query: AdminSalaryPayoutsQueryDto,
  ): Prisma.CoachSalaryPayoutWhereInput {
    const where: Prisma.CoachSalaryPayoutWhereInput = {};
    if (query.month) {
      const period = parseSalaryMonthParam(query.month);
      where.periodYear = period.year;
      where.periodMonth = period.month;
    }
    const coachSearch = buildTokenAndWhere(query.search, (token) => ({
      user: {
        OR: [
          { name: containsInsensitive(token) },
          { lastName: containsInsensitive(token) },
          { email: containsInsensitive(token) },
          { phone: containsInsensitive(token) },
        ],
      },
    }));
    if (coachSearch) {
      where.coachProfile = coachSearch;
    }
    return where;
  }
}
