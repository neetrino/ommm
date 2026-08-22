import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { parseSalaryMonthParam } from './coaches-salary.helpers';
import {
  CoachSalarySummaryService,
  type CoachSalarySummary,
} from './coaches-salary-summary.service';

@Injectable()
export class CoachSalaryPayoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly summary: CoachSalarySummaryService,
  ) {}

  async markMonthPaid(
    actor: User,
    coachProfileId: string,
    month: string,
  ): Promise<CoachSalarySummary> {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { id: coachProfileId },
      select: { id: true, salaryPerClassAmd: true },
    });
    if (!profile) {
      throw new NotFoundException('Coach profile not found');
    }
    const current = await this.summary.forProfile(
      profile.id,
      profile.salaryPerClassAmd,
      month,
    );
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
    return this.summary.forProfile(
      profile.id,
      profile.salaryPerClassAmd,
      month,
    );
  }
}
