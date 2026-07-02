import { Module } from '@nestjs/common';
import { ReportsAnalyticsService } from './reports-analytics.service';
import { ReportsDashboardService } from './reports-dashboard.service';
import { ReportsExportService } from './reports-export.service';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  controllers: [ReportsController],
  providers: [
    ReportsService,
    ReportsDashboardService,
    ReportsExportService,
    ReportsAnalyticsService,
  ],
  exports: [ReportsService],
})
export class ReportsModule {}
