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
import { Role, type User } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CoachesService } from './coaches.service';
import { AdminListCoachesQueryDto } from './dto/admin-list-coaches-query.dto';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';
import { UploadCoachPhotoJsonDto } from './dto/upload-coach-photo-json.dto';

@Controller('coaches')
export class CoachesController {
  constructor(private readonly coaches: CoachesService) {}

  @Get()
  listPublic() {
    return this.coaches.listPublic();
  }

  /** Same RSC / dashboard burst pattern as `GET /users/me` — avoid 429 false “auth failure”. */
  @Get('admin/list')
  @SkipThrottle()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  listAdmin(@Query() query: AdminListCoachesQueryDto) {
    return this.coaches.listAdmin(query);
  }

  @Get('panel/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COACH)
  panelSummary(@CurrentUser() user: { id: string }) {
    return this.coaches.coachPanelSummary(user.id);
  }

  @Get('panel/salary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.COACH)
  panelSalary(@CurrentUser() user: { id: string }) {
    return this.coaches.salarySummary(user.id);
  }

  @Get(':id')
  getPublic(@Param('id') id: string) {
    return this.coaches.getPublic(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateCoachDto) {
    return this.coaches.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateCoachDto,
  ) {
    return this.coaches.update(user, id, dto);
  }

  @Post(':id/photo-json')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  uploadCoachPhotoJson(
    @Param('id') id: string,
    @Body() dto: UploadCoachPhotoJsonDto,
  ) {
    return this.coaches.uploadCoachPhotoJson(id, dto);
  }
}
