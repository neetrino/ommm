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
}
