import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import type { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CoachAnalyticsQueryDto } from './dto/coach-analytics-query.dto';
import { DateRangeQueryDto } from './dto/date-range-query.dto';
import { UserAnalyticsQueryDto } from './dto/user-analytics-query.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('dashboard')
  @Roles(Role.ADMIN, Role.MANAGER)
  dashboard(
    @CurrentUser() user: { role: Role },
    @Query('includeRevenue') includeRevenue?: string,
  ) {
    const canSeeRevenue = user.role === Role.ADMIN;
    const requestedRevenue = includeRevenue === 'true';
    return this.reports.dashboard({
      includeRevenue: canSeeRevenue && requestedRevenue,
    });
  }

  @Get('bookings.csv')
  @Roles(Role.ADMIN)
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
  @Roles(Role.ADMIN, Role.MANAGER)
  financeSummary(@Query() query: DateRangeQueryDto) {
    return this.reports.financeSummary(query);
  }

  @Get('payments.csv')
  @Roles(Role.ADMIN)
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
  @Roles(Role.ADMIN)
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
