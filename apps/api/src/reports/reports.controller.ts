import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Role } from '@prisma/client';
import type { Response } from 'express';
import {
  BACKOFFICE_DELETE_ROLES,
  BACKOFFICE_READ_ROLES,
} from '../common/backoffice-roles';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CoachAnalyticsQueryDto } from './dto/coach-analytics-query.dto';
import { DateRangeQueryDto } from './dto/date-range-query.dto';
import { StudioAnalyticsQueryDto } from './dto/studio-analytics-query.dto';
import { UserAnalyticsQueryDto } from './dto/user-analytics-query.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('dashboard')
  @SkipThrottle()
  @Roles(...BACKOFFICE_READ_ROLES)
  dashboard(
    @CurrentUser() user: { role: Role },
    @Query('includeRevenue') includeRevenue?: string,
    @Query('includeOverview') includeOverview?: string,
  ) {
    /** Finance KPIs stay Admin-only; operational overview is available to Manager. */
    const canSeeRevenue = user.role === Role.ADMIN;
    const requestedRevenue = includeRevenue === 'true';
    const requestedOverview = includeOverview === 'true';
    return this.reports.dashboard({
      includeRevenue: canSeeRevenue && requestedRevenue,
      includeOverview: requestedOverview,
    });
  }

  @Get('bookings.csv')
  @Roles(...BACKOFFICE_DELETE_ROLES)
  async bookingsCsv(
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res: Response,
  ) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid date range');
    }
    if (toDate < fromDate) {
      throw new BadRequestException('Invalid date range');
    }
    const csv = await this.reports.bookingsCsv(fromDate, toDate);
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  }

  @Get('finance/summary')
  @SkipThrottle()
  @Roles(...BACKOFFICE_DELETE_ROLES)
  financeSummary(@Query() query: DateRangeQueryDto) {
    return this.reports.financeSummary(query);
  }

  @Get('analytics')
  @SkipThrottle()
  @Roles(...BACKOFFICE_READ_ROLES)
  studioAnalytics(
    @CurrentUser() user: { role: Role },
    @Query() query: StudioAnalyticsQueryDto,
  ) {
    assertValidReportRange(query.from, query.to);
    return this.reports.studioAnalytics(query, {
      includeFinance: user.role === Role.ADMIN,
    });
  }

  @Get('payments.csv')
  @Roles(...BACKOFFICE_DELETE_ROLES)
  async paymentsCsv(@Query() query: DateRangeQueryDto, @Res() res: Response) {
    if (query.from && Number.isNaN(new Date(query.from).getTime())) {
      throw new BadRequestException('Invalid date range');
    }
    if (query.to && Number.isNaN(new Date(query.to).getTime())) {
      throw new BadRequestException('Invalid date range');
    }
    if (query.from && query.to && new Date(query.to) < new Date(query.from)) {
      throw new BadRequestException('Invalid date range');
    }
    const csv = await this.reports.paymentsCsv(query);
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  }

  @Get('gift-credits.csv')
  @Roles(...BACKOFFICE_DELETE_ROLES)
  async giftCreditsCsv(
    @Query() query: DateRangeQueryDto,
    @Res() res: Response,
  ) {
    if (query.from && Number.isNaN(new Date(query.from).getTime())) {
      throw new BadRequestException('Invalid date range');
    }
    if (query.to && Number.isNaN(new Date(query.to).getTime())) {
      throw new BadRequestException('Invalid date range');
    }
    if (query.from && query.to && new Date(query.to) < new Date(query.from)) {
      throw new BadRequestException('Invalid date range');
    }
    const csv = await this.reports.giftCreditsCsv(query);
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  }

  @Get('coach/analytics')
  @Roles(Role.COACH)
  coachAnalytics(
    @CurrentUser() user: { id: string },
    @Query() query: CoachAnalyticsQueryDto,
  ) {
    return this.reports.coachAnalytics(user.id, query.days ?? 30);
  }

  @Get('user/analytics')
  @Roles(Role.USER)
  userAnalytics(
    @CurrentUser() user: { id: string },
    @Query() query: UserAnalyticsQueryDto,
  ) {
    return this.reports.userAnalytics(user.id, query.days ?? 90);
  }
}

function assertValidReportRange(from?: string, to?: string): void {
  if (from && Number.isNaN(new Date(from).getTime())) {
    throw new BadRequestException('Invalid date range');
  }
  if (to && Number.isNaN(new Date(to).getTime())) {
    throw new BadRequestException('Invalid date range');
  }
  if (from && to && new Date(to) < new Date(from)) {
    throw new BadRequestException('Invalid date range');
  }
}
