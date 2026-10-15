import { Module } from '@nestjs/common';
import { ManagerDailyFinanceService } from './manager-daily-finance.service';
import { ManagerInvitesAnalyticsService } from './manager-invites-analytics.service';
import { ReportsAnalyticsService } from './reports-analytics.service';
import { ReportsDashboardService } from './reports-dashboard.service';
import { ReportsExportService } from './reports-export.service';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { StudioAnalyticsQueriesService } from './studio-analytics-queries.service';
import { StudioAnalyticsService } from './studio-analytics.service';

@Module({
  controllers: [ReportsController],
  providers: [
    ReportsService,
    ReportsDashboardService,
    ReportsExportService,
    ReportsAnalyticsService,
    ManagerInvitesAnalyticsService,
    ManagerDailyFinanceService,
    StudioAnalyticsQueriesService,
    StudioAnalyticsService,
  ],
  exports: [ReportsService],
})
export class ReportsModule {}
