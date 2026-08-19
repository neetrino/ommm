import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { User } from '@prisma/client';
import { BACKOFFICE_WRITE_ROLES } from '../common/backoffice-roles';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CallTasksService } from './call-tasks.service';
import { CreateCallTaskDto } from './dto/create-call-task.dto';
import { ListCallTasksQueryDto } from './dto/list-call-tasks-query.dto';
import { UpdateCallTaskDto } from './dto/update-call-task.dto';

@Controller('call-tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...BACKOFFICE_WRITE_ROLES)
export class CallTasksController {
  constructor(private readonly callTasks: CallTasksService) {}

  @Get()
  @SkipThrottle()
  list(@Query() query: ListCallTasksQueryDto) {
    return this.callTasks.list(query);
  }

  @Get('pending-count')
  @SkipThrottle()
  countPending() {
    return this.callTasks.countPending();
  }

  @Get('due')
  @SkipThrottle()
  listDue() {
    return this.callTasks.listDue();
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateCallTaskDto) {
    return this.callTasks.create(user.id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCallTaskDto) {
    return this.callTasks.update(id, dto);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string) {
    return this.callTasks.complete(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.callTasks.cancel(id);
  }
}
