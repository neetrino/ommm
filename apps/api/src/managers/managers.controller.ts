import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Role, type User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminListManagersQueryDto } from './dto/admin-list-managers-query.dto';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { ManagersService } from './managers.service';

@Controller('managers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ManagersController {
  constructor(private readonly managers: ManagersService) {}

  @Get()
  @SkipThrottle()
  list(@CurrentUser() user: User, @Query() query: AdminListManagersQueryDto) {
    return this.managers.list(user.id, query);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateManagerDto) {
    return this.managers.create(user, dto);
  }

  @Get(':id')
  @SkipThrottle()
  getById(@CurrentUser() user: User, @Param('id') id: string) {
    return this.managers.getById(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateManagerDto,
  ) {
    return this.managers.update(user, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.managers.remove(user, id);
  }

  @Post(':id/resend-invite')
  resendInvite(@CurrentUser() user: User, @Param('id') id: string) {
    return this.managers.resendInvite(user, id);
  }
}
