import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  BACKOFFICE_DELETE_ROLES,
  BACKOFFICE_WRITE_ROLES,
} from '../common/backoffice-roles';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateScheduleItemDto } from './dto/create-schedule-item.dto';
import { UpdateScheduleItemDto } from './dto/update-schedule-item.dto';
import { PUBLIC_SCHEDULE_HTTP_CACHE_CONTROL } from './schedule-public-http-cache';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly schedule: ScheduleService) {}

  @Get('public')
  @Header('Cache-Control', PUBLIC_SCHEDULE_HTTP_CACHE_CONTROL)
  listPublic(@Query('from') from?: string, @Query('to') to?: string) {
    return this.schedule.listPublicActive({ from, to });
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  listAdmin() {
    return this.schedule.listAdmin();
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  create(@Body() dto: CreateScheduleItemDto) {
    return this.schedule.create(dto);
  }

  @Patch('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  update(@Param('id') id: string, @Body() dto: UpdateScheduleItemDto) {
    return this.schedule.update(id, dto);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_DELETE_ROLES)
  remove(@Param('id') id: string) {
    return this.schedule.remove(id);
  }
}
