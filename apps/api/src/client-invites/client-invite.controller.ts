import { Controller, Get, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { User } from '@prisma/client';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ClientInviteService } from './client-invite.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientInviteController {
  constructor(private readonly invites: ClientInviteService) {}

  @Get('me/client-invite')
  @SkipThrottle()
  @Roles(Role.ADMIN, Role.MANAGER)
  summary(@CurrentUser() user: User) {
    return this.invites.summaryFor(user);
  }
}
