import { Injectable } from '@nestjs/common';
import { DateRangeQueryDto } from './dto/date-range-query.dto';
import { StudioAnalyticsQueryDto } from './dto/studio-analytics-query.dto';
import { ReportsAnalyticsService } from './reports-analytics.service';
import {
  DashboardOptions,
  ReportsDashboardService,
} from './reports-dashboard.service';
import { ReportsExportService } from './reports-export.service';
import { StudioAnalyticsService } from './studio-analytics.service';

export type { DashboardOptions };

@Injectable()
export class ReportsService {
  constructor(
    private readonly dashboardService: ReportsDashboardService,
    private readonly exportService: ReportsExportService,
    private readonly analyticsService: ReportsAnalyticsService,
    private readonly studioAnalyticsService: StudioAnalyticsService,
  ) {}

  dashboard(options?: DashboardOptions) {
    return this.dashboardService.dashboard(options);
  }

  bookingsCsv(from: Date, to: Date) {
    return this.exportService.bookingsCsv(from, to);
  }

  financeSummary(range: DateRangeQueryDto) {
    return this.exportService.financeSummary(range);
  }

  paymentsCsv(range: DateRangeQueryDto) {
    return this.exportService.paymentsCsv(range);
  }

  giftCreditsCsv(range: DateRangeQueryDto) {
    return this.exportService.giftCreditsCsv(range);
  }

  coachAnalytics(userId: string, days: number) {
    return this.analyticsService.coachAnalytics(userId, days);
  }

  userAnalytics(userId: string, days: number) {
    return this.analyticsService.userAnalytics(userId, days);
  }

  studioAnalytics(query: StudioAnalyticsQueryDto, options?: { includeFinance?: boolean }) {
    return this.studioAnalyticsService.studioAnalytics(query, options);
  }
}
