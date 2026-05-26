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
import { ClassSessionStatus, Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ClassesService } from './classes.service';
import { AdminListSessionsQueryDto } from './dto/admin-list-sessions-query.dto';
import { CreateClassTypeDto } from './dto/create-class-type.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Controller('classes')
export class ClassesController {
  constructor(private readonly classes: ClassesService) {}

  @Get('types')
  listTypes() {
    return this.classes.listTypes();
  }

  @Post('types')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  createType(@Body() dto: CreateClassTypeDto) {
    return this.classes.createType(dto);
  }

  @Delete('types/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deleteType(@Param('id') id: string) {
    return this.classes.deleteType(id);
  }

  @Get('sessions')
  listSessions(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('coachId') coachId?: string,
    @Query('typeId') typeId?: string,
  ) {
    const fromD = new Date(from);
    const toD = new Date(to);
    return this.classes.listSessionsPublic({
      from: fromD,
      to: toD,
      coachId,
      typeId,
    });
  }

  @Get('sessions/:id')
  getSession(@Param('id') id: string) {
    return this.classes.getSessionPublic(id);
  }

  @Get('admin/sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  listAdminSessions(@Query() query: AdminListSessionsQueryDto) {
    return this.classes.listSessionsAdmin(query);
  }

  @Post('sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createSession(@Body() dto: CreateSessionDto) {
    return this.classes.createSession(dto);
  }

  @Patch('sessions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateSession(@Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return this.classes.updateSession(id, dto);
  }

  @Post('sessions/:id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  cancelSession(@Param('id') id: string) {
    return this.classes.cancelSession(id);
  }

  @Post('sessions/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  setStatus(
    @Param('id') id: string,
    @Body('status') status: ClassSessionStatus,
  ) {
    return this.classes.updateSessionStatus(id, status);
  }

  @Delete('sessions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deleteSession(@Param('id') id: string) {
    return this.classes.deleteSession(id);
  }
}
