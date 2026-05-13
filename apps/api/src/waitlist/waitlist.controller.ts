import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ManualNotifyWaitlistEntryDto } from './dto/manual-notify-waitlist-entry.dto';
import { PromoteWaitlistEntryDto } from './dto/promote-waitlist-entry.dto';
import { WaitlistService } from './waitlist.service';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlist: WaitlistService) {}

  @Post('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  join(
    @CurrentUser() user: { id: string },
    @Param('sessionId') sessionId: string,
  ) {
    return this.waitlist.join(user.id, sessionId);
  }

  @Delete('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  leave(
    @CurrentUser() user: { id: string },
    @Param('sessionId') sessionId: string,
  ) {
    return this.waitlist.leave(user.id, sessionId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  mine(@CurrentUser() user: { id: string }) {
    return this.waitlist.listMine(user.id);
  }

  @Get('admin/recent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  adminRecent(@Query('take') take?: string) {
    const n = take ? Number.parseInt(take, 10) : 150;
    return this.waitlist.listAdminRecent(Number.isFinite(n) ? n : 150);
  }

  @Get('sessions/:sessionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.COACH)
  forSession(@Param('sessionId') sessionId: string) {
    return this.waitlist.listForSession(sessionId);
  }

  @Delete('entries/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  remove(@Param('id') id: string) {
    return this.waitlist.remove(id);
  }

  @Post('entries/:id/promote')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  promote(@Param('id') id: string, @Body() dto: PromoteWaitlistEntryDto) {
    return this.waitlist.promoteToBooking(id, dto.targetSessionId);
  }

  @Post('entries/:id/notify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  notify(
    @CurrentUser() user: { id: string; name?: string | null; role: Role },
    @Param('id') id: string,
    @Body() dto: ManualNotifyWaitlistEntryDto,
  ) {
    return this.waitlist.manualNotify(id, {
      subject: dto.subject,
      message: dto.message,
      actorName: user.name ?? null,
      actorId: user.id,
      actorRole: user.role,
    });
  }
}
