import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  parseSalaryMonthParam,
  unpaidSalaryAmd,
} from './coaches-salary.helpers';

export type CoachSalarySummary = {
  coachProfileId: string;
  completedSessions: number;
  totalEarningsCents: number;
  salaryPerClassAmd: number;
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
      select: { id: true, salaryPerClassAmd: true },
    });
    if (!profile) {
      return null;
    }
    return this.forProfile(profile.id, profile.salaryPerClassAmd, month);
  }

  async forProfile(
    coachProfileId: string,
    salaryPerClassAmd: number,
    month?: string,
  ): Promise<CoachSalarySummary> {
    const period = parseSalaryMonthParam(month);
    const where = {
      coachProfileId,
      periodYear: period.year,
      periodMonth: period.month,
    };
    const [accrualAgg, payoutAgg] = await Promise.all([
      this.prisma.coachSalaryAccrual.aggregate({
        where,
        _sum: { amountAmd: true },
        _count: true,
      }),
      this.prisma.coachSalaryPayout.aggregate({
        where,
        _sum: { amountAmd: true },
      }),
    ]);
    const totalEarningsCents = accrualAgg._sum.amountAmd ?? 0;
    const paidOutCents = payoutAgg._sum.amountAmd ?? 0;
    return {
      coachProfileId,
      completedSessions: accrualAgg._count,
      totalEarningsCents,
      salaryPerClassAmd,
      basePerSessionCents: salaryPerClassAmd,
      perAttendeeShareCents: 0,
      pendingPayoutCents: unpaidSalaryAmd(totalEarningsCents, paidOutCents),
      paidOutCents,
    };
  }
}
