import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ClassSessionStatus } from '@prisma/client';
import {
  BACKOFFICE_DELETE_ROLES,
  BACKOFFICE_WRITE_ROLES,
} from '../common/backoffice-roles';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { resolvePublicScheduleRange } from '../schedule/public-schedule-range';
import { ClassesService } from './classes.service';
import { AdminListSessionsQueryDto } from './dto/admin-list-sessions-query.dto';
import { CreateClassTypeDto } from './dto/create-class-type.dto';
import { CreateSessionBatchDto } from './dto/create-session-batch.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateClassTypeDto } from './dto/update-class-type.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classes: ClassesService) {}

  /** Admin schedule RSC + filters — same burst pattern as `GET /coaches/admin/list`. */
  @Get('types')
  @SkipThrottle()
  listTypes() {
    return this.classes.listTypes();
  }

  @Post('types')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  createType(@Body() dto: CreateClassTypeDto) {
    return this.classes.createType(dto);
  }

  @Patch('types/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  updateType(@Param('id') id: string, @Body() dto: UpdateClassTypeDto) {
    return this.classes.updateType(id, dto);
  }

  @Delete('types/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_DELETE_ROLES)
  deleteType(@Param('id') id: string) {
    return this.classes.deleteType(id);
  }

  @Get('sessions')
  listSessions(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('coachId') coachId?: string,
    @Query('typeId') typeId?: string,
  ) {
    const range = resolvePublicScheduleRange(from, to);
    return this.classes.listSessionsPublic({
      from: range.from,
      to: range.to,
      coachId,
      typeId,
    });
  }

  @Get('sessions/:id')
  getSession(@Param('id') id: string) {
    return this.classes.getSessionPublic(id);
  }

  @Get('admin/sessions')
  @SkipThrottle()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  listAdminSessions(@Query() query: AdminListSessionsQueryDto) {
    return this.classes.listSessionsAdmin(query);
  }

  @Post('sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  createSession(@Body() dto: CreateSessionDto) {
    return this.classes.createSession(dto);
  }

  @Post('sessions/batch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  createSessionBatch(@Body() dto: CreateSessionBatchDto) {
    return this.classes.createSessionBatch(dto);
  }

  @Patch('sessions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  updateSession(@Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return this.classes.updateSession(id, dto);
  }

  @Post('sessions/:id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  cancelSession(@Param('id') id: string) {
    return this.classes.cancelSession(id);
  }

  @Post('sessions/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  setStatus(
    @Param('id') id: string,
    @Body('status') status: ClassSessionStatus,
  ) {
    return this.classes.updateSessionStatus(id, status);
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_DELETE_ROLES)
  deleteSession(@Param('id') id: string) {
    return this.classes.deleteSession(id);
  }
}
