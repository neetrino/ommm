import { Injectable } from '@nestjs/common';
import { ClassSessionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { joinName } from './reports.helpers';
import { loadStudioAnalyticsGiftCredits } from './studio-analytics-gift-queries';
import { loadStudioAnalyticsMembers } from './studio-analytics-member-queries';
import {
  loadStudioAnalyticsPackagePlans,
  loadStudioAnalyticsPayments,
} from './studio-analytics-payment-queries';
import {
  emptyGiftCredits,
  STUDIO_ANALYTICS_LABEL_CAP,
  STUDIO_ANALYTICS_ROW_CAP,
} from './studio-analytics.helpers';
import type {
  StudioAnalyticsConsumptionRow,
  StudioAnalyticsFilters,
  StudioAnalyticsLoadedRange,
  StudioAnalyticsLoadMode,
  StudioAnalyticsSessionRow,
} from './studio-analytics.types';

export function buildSessionScopeWhere(
  from: Date,
  to: Date,
  filters: StudioAnalyticsFilters,
): Prisma.ClassSessionWhereInput {
  return {
    startsAt: { gte: from, lte: to },
    status: { not: ClassSessionStatus.CANCELLED },
    ...(filters.coachId ? { coachId: filters.coachId } : {}),
    ...(filters.classTypeId ? { classTypeId: filters.classTypeId } : {}),
  };
}

export type StudioAnalyticsLoadParams = {
  from: Date;
  to: Date;
  filters: StudioAnalyticsFilters;
  mode: StudioAnalyticsLoadMode;
  previous?: { from: Date; to: Date };
};

@Injectable()
export class StudioAnalyticsQueriesService {
  constructor(private readonly prisma: PrismaService) {}

  async loadRange(
    params: StudioAnalyticsLoadParams,
  ): Promise<StudioAnalyticsLoadedRange> {
    const sessions = await this.loadSessions(params);
    const sessionIds = sessions.map((session) => session.id);
    const side = await this.loadRangeSideData(params, sessions, sessionIds);
    return {
      from: params.from,
      to: params.to,
      sessions,
      ...side,
    };
  }

  private async loadRangeSideData(
    params: StudioAnalyticsLoadParams,
    sessions: StudioAnalyticsSessionRow[],
    sessionIds: string[],
  ) {
    const isFull = params.mode === 'full';
    const [
      bookingGroups,
      waitlistGroups,
      payments,
      consumptions,
      labels,
      members,
      giftCredits,
    ] = await Promise.all([
      this.loadBookingGroups(sessionIds),
      isFull ? this.loadWaitlistGroups(sessionIds) : Promise.resolve([]),
      loadStudioAnalyticsPayments(this.prisma, params.from, params.to),
      isFull ? this.loadConsumptions(params) : Promise.resolve([]),
      isFull
        ? this.loadLabels(sessions)
        : Promise.resolve({ coaches: [], classTypes: [] }),
      loadStudioAnalyticsMembers(this.prisma, params, buildSessionScopeWhere),
      isFull
        ? loadStudioAnalyticsGiftCredits(this.prisma, params.from, params.to)
        : Promise.resolve(emptyGiftCredits()),
    ]);
    const packagePlans = isFull
      ? await loadStudioAnalyticsPackagePlans(this.prisma, payments)
      : [];
    return {
      bookingGroups,
      waitlistGroups,
      payments,
      packagePlans,
      consumptions,
      coaches: labels.coaches,
      classTypes: labels.classTypes,
      filters: params.filters,
      members,
      giftCredits,
    };
  }

  private async loadSessions(
    params: StudioAnalyticsLoadParams,
  ): Promise<StudioAnalyticsSessionRow[]> {
    return this.prisma.classSession.findMany({
      where: buildSessionScopeWhere(params.from, params.to, params.filters),
      select: {
        id: true,
        startsAt: true,
        capacity: true,
        coachId: true,
        classTypeId: true,
        priceCents: true,
      },
      orderBy: { startsAt: 'asc' },
      take: STUDIO_ANALYTICS_ROW_CAP,
    });
  }

  private async loadBookingGroups(sessionIds: string[]) {
    if (sessionIds.length === 0) return [];
    const rows = await this.prisma.booking.groupBy({
      by: ['sessionId', 'status', 'channel'],
      where: { sessionId: { in: sessionIds } },
      _count: { id: true },
    });
    return rows.map((row) => ({
      sessionId: row.sessionId,
      status: row.status,
      channel: row.channel,
      count: row._count.id,
    }));
  }

  private async loadWaitlistGroups(sessionIds: string[]) {
    if (sessionIds.length === 0) return [];
    const rows = await this.prisma.waitlistEntry.groupBy({
      by: ['sessionId', 'status'],
      where: { sessionId: { in: sessionIds } },
      _count: { id: true },
    });
    return rows.map((row) => ({
      sessionId: row.sessionId,
      status: row.status,
      count: row._count.id,
    }));
  }

  private async loadConsumptions(
    params: StudioAnalyticsLoadParams,
  ): Promise<StudioAnalyticsConsumptionRow[]> {
    const rows = await this.prisma.bookingConsumption.findMany({
      where: {
        restoredAt: null,
        consumedAt: { gte: params.from, lte: params.to },
        booking: {
          session: buildSessionScopeWhere(
            params.from,
            params.to,
            params.filters,
          ),
        },
      },
      select: {
        restoredAt: true,
        consumedSessions: true,
        booking: {
          select: {
            session: {
              select: {
                id: true,
                coachId: true,
                classTypeId: true,
                priceCents: true,
              },
            },
          },
        },
        userPackage: {
          select: { planPriceCentsSnapshot: true, sessionsTotal: true },
        },
      },
      take: STUDIO_ANALYTICS_ROW_CAP,
    });
    return rows.map((row) => ({
      restoredAt: row.restoredAt,
      consumedSessions: row.consumedSessions,
      sessionId: row.booking.session.id,
      coachId: row.booking.session.coachId,
      classTypeId: row.booking.session.classTypeId,
      sessionPriceCents: row.booking.session.priceCents,
      planPriceCentsSnapshot: row.userPackage.planPriceCentsSnapshot,
      sessionsTotal: row.userPackage.sessionsTotal,
    }));
  }

  private async loadLabels(sessions: StudioAnalyticsSessionRow[]) {
    const coachIds = [...new Set(sessions.map((session) => session.coachId))];
    const [coaches, classTypes] = await Promise.all([
      coachIds.length === 0
        ? Promise.resolve([])
        : this.prisma.coachProfile.findMany({
            where: { id: { in: coachIds } },
            select: {
              id: true,
              isActive: true,
              user: { select: { name: true, lastName: true, email: true } },
            },
          }),
      this.prisma.classType.findMany({
        select: { id: true, name: true },
        take: STUDIO_ANALYTICS_LABEL_CAP,
      }),
    ]);
    return {
      coaches: coaches.map((coach) => ({
        id: coach.id,
        label: joinName(coach.user.name, coach.user.lastName, coach.user.email),
        isActive: coach.isActive,
      })),
      classTypes: classTypes.map((item) => ({ id: item.id, label: item.name })),
    };
  }
}
