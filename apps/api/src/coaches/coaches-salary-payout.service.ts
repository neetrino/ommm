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

type PayoutGroupKey = {
  coachProfileId: string;
  periodYear: number;
  periodMonth: number;
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
    const [groups, paidAgg] = await Promise.all([
      this.prisma.coachSalaryPayout.groupBy({
        by: ['coachProfileId', 'periodYear', 'periodMonth'],
        where,
        _sum: { amountAmd: true },
        _max: { paidAt: true },
      }),
      this.prisma.coachSalaryPayout.aggregate({
        where,
        _sum: { amountAmd: true },
      }),
    ]);

    const sortedGroups = [...groups].sort((left, right) => {
      const leftPaid = left._max.paidAt?.getTime() ?? 0;
      const rightPaid = right._max.paidAt?.getTime() ?? 0;
      if (rightPaid !== leftPaid) {
        return rightPaid - leftPaid;
      }
      if (right.periodYear !== left.periodYear) {
        return right.periodYear - left.periodYear;
      }
      return right.periodMonth - left.periodMonth;
    });

    const total = sortedGroups.length;
    const pageGroups = sortedGroups.slice(offset, offset + take);
    const items = await this.mapGroupedPayouts(pageGroups);

    return {
      items,
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
    const existingRows = await this.prisma.coachSalaryPayout.findMany({
      where: {
        coachProfileId: profile.id,
        periodYear: period.year,
        periodMonth: period.month,
      },
      orderBy: [{ paidAt: 'asc' }, { id: 'asc' }],
      select: { id: true, amountAmd: true },
    });
    const previousPaidAmd = existingRows.reduce(
      (sum, row) => sum + row.amountAmd,
      0,
    );
    const nextAmountAmd = previousPaidAmd + current.pendingPayoutCents;
    const keep = existingRows[0];

    if (!keep) {
      await this.prisma.coachSalaryPayout.create({
        data: {
          coachProfileId: profile.id,
          amountAmd: nextAmountAmd,
          periodYear: period.year,
          periodMonth: period.month,
          paidByAdminId: actor.id,
        },
      });
    } else {
      const duplicateIds = existingRows.slice(1).map((row) => row.id);
      await this.prisma.$transaction([
        this.prisma.coachSalaryPayout.update({
          where: { id: keep.id },
          data: {
            amountAmd: nextAmountAmd,
            paidAt: new Date(),
            paidByAdminId: actor.id,
          },
        }),
        ...(duplicateIds.length > 0
          ? [
              this.prisma.coachSalaryPayout.deleteMany({
                where: { id: { in: duplicateIds } },
              }),
            ]
          : []),
      ]);
    }

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

  private async mapGroupedPayouts(
    groups: Array<
      PayoutGroupKey & {
        _sum: { amountAmd: number | null };
        _max: { paidAt: Date | null };
      }
    >,
  ): Promise<AdminSalaryPayoutListItem[]> {
    if (groups.length === 0) {
      return [];
    }

    const coachIds = [...new Set(groups.map((group) => group.coachProfileId))];
    const profiles = await this.prisma.coachProfile.findMany({
      where: { id: { in: coachIds } },
      select: {
        id: true,
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
    });
    const profileById = new Map(
      profiles.map((profile) => [profile.id, profile]),
    );

    const latestRows = await Promise.all(
      groups.map((group) =>
        this.prisma.coachSalaryPayout.findFirst({
          where: {
            coachProfileId: group.coachProfileId,
            periodYear: group.periodYear,
            periodMonth: group.periodMonth,
          },
          orderBy: [{ paidAt: 'desc' }, { id: 'desc' }],
          select: { id: true },
        }),
      ),
    );

    return groups.flatMap((group, index) => {
      const profile = profileById.get(group.coachProfileId);
      const latestId = latestRows[index]?.id;
      if (!profile || !latestId) {
        return [];
      }
      return [
        {
          id: latestId,
          coachProfileId: group.coachProfileId,
          amountAmd: group._sum.amountAmd ?? 0,
          periodYear: group.periodYear,
          periodMonth: group.periodMonth,
          paidAt: group._max.paidAt ?? new Date(0),
          coach: {
            userId: profile.userId,
            name: profile.user.name,
            lastName: profile.user.lastName,
            phone: profile.user.phone,
            email: profile.user.email,
          },
        },
      ];
    });
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
