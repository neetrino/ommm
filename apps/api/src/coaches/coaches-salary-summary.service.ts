import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  resolveSalaryPeriodsInQuery,
  resolveSalaryStartsAtFilter,
  type SalaryDateRangeQuery,
} from './coaches-salary-list-filters';
import {
  parseSalaryMonthParam,
  unpaidSalaryAmd,
} from './coaches-salary.helpers';

export type CoachSalarySummary = {
  coachProfileId: string;
  completedSessions: number;
  totalEarningsCents: number;
  /** @deprecated Flat rate removed; kept as 0 for API compatibility. */
  salaryPerClassAmd: number;
  /** @deprecated Flat rate removed; kept as 0 for API compatibility. */
  basePerSessionCents: number;
  perAttendeeShareCents: number;
  pendingPayoutCents: number;
  paidOutCents: number;
};

@Injectable()
export class CoachSalarySummaryService {
  constructor(private readonly prisma: PrismaService) {}

  async forUserId(
    userId: string,
    month?: string,
  ): Promise<CoachSalarySummary | null> {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      return null;
    }
    return this.forProfile(profile.id, { month });
  }

  async forProfile(
    coachProfileId: string,
    scope: string | SalaryDateRangeQuery = {},
  ): Promise<CoachSalarySummary> {
    const query: SalaryDateRangeQuery =
      typeof scope === 'string' ? { month: scope } : scope;
    const hasDayRange = Boolean(query.from || query.to);

    if (hasDayRange) {
      return this.forProfileDateRange(coachProfileId, query);
    }

    const period = parseSalaryMonthParam(query.month);
    const where = {
      coachProfileId,
      periodYear: period.year,
      periodMonth: period.month,
    };
    return this.aggregateForWhere(coachProfileId, where, where);
  }

  private async forProfileDateRange(
    coachProfileId: string,
    query: SalaryDateRangeQuery,
  ): Promise<CoachSalarySummary> {
    const startsAt = resolveSalaryStartsAtFilter(query);
    const periods = resolveSalaryPeriodsInQuery(query);
    const payoutWhere: Prisma.CoachSalaryPayoutWhereInput = {
      coachProfileId,
      OR: periods.map((period) => ({
        periodYear: period.year,
        periodMonth: period.month,
      })),
    };
    const accrualWhere: Prisma.CoachSalaryAccrualWhereInput = {
      coachProfileId,
      classSession: { startsAt },
    };
    return this.aggregateForWhere(coachProfileId, accrualWhere, payoutWhere);
  }

  private async aggregateForWhere(
    coachProfileId: string,
    accrualWhere: Prisma.CoachSalaryAccrualWhereInput,
    payoutWhere: Prisma.CoachSalaryPayoutWhereInput,
  ): Promise<CoachSalarySummary> {
    const [accrualAgg, payoutAgg] = await Promise.all([
      this.prisma.coachSalaryAccrual.aggregate({
        where: accrualWhere,
        _sum: { amountAmd: true },
        _count: true,
      }),
      this.prisma.coachSalaryPayout.aggregate({
        where: payoutWhere,
        _sum: { amountAmd: true },
      }),
    ]);
    const totalEarningsCents = accrualAgg._sum.amountAmd ?? 0;
    const paidOutCents = payoutAgg._sum.amountAmd ?? 0;
    return {
      coachProfileId,
      completedSessions: accrualAgg._count,
      totalEarningsCents,
      salaryPerClassAmd: 0,
      basePerSessionCents: 0,
      perAttendeeShareCents: 0,
      pendingPayoutCents: unpaidSalaryAmd(totalEarningsCents, paidOutCents),
      paidOutCents,
    };
  }
}
