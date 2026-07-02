import { Injectable } from '@nestjs/common';
import { BookingStatus, WaitlistStatus } from '@prisma/client';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import {
  COACH_SALARY_FILTER_SCAN_LIMIT,
  filterCoachSalaryRows,
  requiresCoachSalaryPostProcessing,
  resolveSalaryMonthRange,
  sortCoachSalaryRows,
} from './coaches-salary-list-filters';
import type { AdminSalarySummariesQueryDto } from './dto/admin-salary-summaries-query.dto';

@Injectable()
export class CoachesPanelService {
  constructor(private readonly prisma: PrismaService) {}

  async coachPanelSummary(userId: string) {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      return null;
    }
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const [todaySessions, bookedToday, waitlists] = await Promise.all([
      this.prisma.classSession.count({
        where: {
          coachId: profile.id,
          startsAt: { gte: todayStart, lt: todayEnd },
        },
      }),
      this.prisma.booking.count({
        where: {
          status: BookingStatus.BOOKED,
          session: {
            coachId: profile.id,
            startsAt: { gte: todayStart, lt: todayEnd },
          },
        },
      }),
      this.prisma.waitlistEntry.count({
        where: {
          status: WaitlistStatus.ACTIVE,
          session: { coachId: profile.id },
        },
      }),
    ]);

    return {
      coachProfileId: profile.id,
      todaySessions,
      bookedToday,
      activeWaitlistsForCoachSessions: waitlists,
    };
  }

  async adminSalarySummaries(query: AdminSalarySummariesQueryDto = {}) {
    const hasPagination =
      query.take !== undefined || query.offset !== undefined;
    const include = {
      user: {
        select: {
          id: true,
          name: true,
          lastName: true,
          phone: true,
          email: true,
        },
      },
      _count: {
        select: {
          sessions: true,
        },
      },
    } as const;
    const orderBy = { createdAt: 'desc' as const };
    const search = query.search?.trim();
    const profileWhere = search
      ? {
          OR: [
            {
              user: {
                name: { contains: search, mode: 'insensitive' as const },
              },
            },
            {
              user: {
                lastName: { contains: search, mode: 'insensitive' as const },
              },
            },
            {
              user: {
                email: { contains: search, mode: 'insensitive' as const },
              },
            },
            {
              user: {
                phone: { contains: search, mode: 'insensitive' as const },
              },
            },
          ],
        }
      : undefined;

    const mapProfile = async (profile: {
      id: string;
      userId: string;
      isActive: boolean;
      user: {
        id: string;
        name: string | null;
        lastName: string | null;
        phone: string | null;
        email: string;
      };
      _count: { sessions: number };
    }) => ({
      coachProfileId: profile.id,
      userId: profile.userId,
      isActive: profile.isActive,
      user: profile.user,
      totalClasses: profile._count.sessions,
      salary: await this.salarySummary(profile.userId, query.month),
    });

    if (!hasPagination) {
      const profiles = await this.prisma.coachProfile.findMany({
        where: profileWhere,
        include,
        orderBy,
      });
      const items = await Promise.all(profiles.map(mapProfile));
      return { items };
    }

    const take = query.take ?? DEFAULT_LIST_PAGE_SIZE;
    const offset = query.offset ?? 0;

    if (requiresCoachSalaryPostProcessing(query)) {
      const profiles = await this.prisma.coachProfile.findMany({
        where: profileWhere,
        include,
        orderBy,
        take: COACH_SALARY_FILTER_SCAN_LIMIT,
      });
      const mapped = await Promise.all(profiles.map(mapProfile));
      const filtered = sortCoachSalaryRows(
        filterCoachSalaryRows(mapped, query),
        query.order,
      );
      return {
        items: filtered.slice(offset, offset + take),
        total: filtered.length,
        take,
        offset,
      };
    }

    const [profiles, total] = await Promise.all([
      this.prisma.coachProfile.findMany({
        where: profileWhere,
        include,
        orderBy,
        take,
        skip: offset,
      }),
      this.prisma.coachProfile.count({ where: profileWhere }),
    ]);
    const items = sortCoachSalaryRows(
      await Promise.all(profiles.map(mapProfile)),
      query.order,
    );
    return { items, total, take, offset };
  }

  async salarySummary(userId: string, month?: string) {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      return null;
    }
    const { from, to } = resolveSalaryMonthRange(month);
    const sessions = await this.prisma.classSession.findMany({
      where: {
        coachId: profile.id,
        startsAt: { gte: from, lt: to },
      },
      include: {
        bookings: {
          where: {
            status: BookingStatus.COMPLETED,
          },
        },
      },
      orderBy: { startsAt: 'desc' },
      take: 300,
    });
    const perAttendeeShareCents = 1000;
    const basePerSessionCents = 3000;
    const completedSessions = sessions.filter((s) => s.bookings.length > 0);
    const totalEarningsCents = completedSessions.reduce((sum, s) => {
      return (
        sum + basePerSessionCents + s.bookings.length * perAttendeeShareCents
      );
    }, 0);
    return {
      coachProfileId: profile.id,
      completedSessions: completedSessions.length,
      totalEarningsCents,
      basePerSessionCents,
      perAttendeeShareCents,
      pendingPayoutCents: Math.round(totalEarningsCents * 0.4),
      paidOutCents: Math.round(totalEarningsCents * 0.6),
    };
  }
}
