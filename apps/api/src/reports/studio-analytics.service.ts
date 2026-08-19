import { Injectable } from '@nestjs/common';
import { resolveRange } from './reports.helpers';
import { StudioAnalyticsQueriesService } from './studio-analytics-queries.service';
import { aggregateStudioRange } from './studio-analytics.aggregate';
import {
  optionalFilterId,
  resolvePreviousPeriod,
  toMetricComparison,
} from './studio-analytics.helpers';
import type { StudioAnalyticsQueryDto } from './dto/studio-analytics-query.dto';
import type {
  StudioAnalyticsFilters,
  StudioAnalyticsPayload,
} from './studio-analytics.types';

@Injectable()
export class StudioAnalyticsService {
  constructor(private readonly queries: StudioAnalyticsQueriesService) {}

  /**
   * Admin studio analytics for a resolved inclusive date range, plus the
   * immediately preceding window of the same duration.
   */
  async studioAnalytics(
    query: StudioAnalyticsQueryDto,
  ): Promise<StudioAnalyticsPayload> {
    const resolved = resolveRange(query);
    const from = new Date(resolved.from);
    const to = new Date(resolved.to);
    const previous = resolvePreviousPeriod(from, to);
    const filters = resolveFilters(query);
    const [currentLoaded, previousLoaded] = await Promise.all([
      this.queries.loadRange({
        from,
        to,
        filters,
        mode: 'full',
        previous: {
          from: previous.previousFrom,
          to: previous.previousTo,
        },
      }),
      this.queries.loadRange({
        from: previous.previousFrom,
        to: previous.previousTo,
        filters,
        mode: 'comparison',
      }),
    ]);
    const current = aggregateStudioRange(currentLoaded);
    const prior = aggregateStudioRange(previousLoaded);
    return {
      range: {
        from: from.toISOString(),
        to: to.toISOString(),
        previousFrom: previous.previousFrom.toISOString(),
        previousTo: previous.previousTo.toISOString(),
      },
      comparison: buildComparison(
        current.comparisonSlice,
        prior.comparisonSlice,
      ),
      kpis: current.kpis,
      daily: current.daily,
      revenue: current.revenue,
      operations: current.operations,
      members: current.members,
      coaches: current.coaches,
    };
  }
}

function buildComparison(
  current: ReturnType<typeof aggregateStudioRange>['comparisonSlice'],
  prior: ReturnType<typeof aggregateStudioRange>['comparisonSlice'],
): StudioAnalyticsPayload['comparison'] {
  return {
    revenueCents: toMetricComparison(current.revenueCents, prior.revenueCents),
    bookings: toMetricComparison(current.bookings, prior.bookings),
    attendanceRate: toMetricComparison(
      current.attendanceRate,
      prior.attendanceRate,
    ),
    occupancyRate: toMetricComparison(
      current.occupancyRate,
      prior.occupancyRate,
    ),
    newMembers: toMetricComparison(current.newMembers, prior.newMembers),
  };
}

function resolveFilters(
  query: StudioAnalyticsQueryDto,
): StudioAnalyticsFilters {
  return {
    coachId: optionalFilterId(query.coachId),
    classTypeId: optionalFilterId(query.classTypeId),
  };
}
