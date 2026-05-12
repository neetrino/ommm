import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import type { Response } from 'express';
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
  dashboard() {
    return this.reports.dashboard();
  }

  @Get('bookings.csv')
  @Roles(Role.ADMIN)
  async bookingsCsv(
    @Query('from') from: string,
    @Query('to') to: string,
    @Res() res: Response,
  ) {
    const csv = await this.reports.bookingsCsv(new Date(from), new Date(to));
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  }
}
