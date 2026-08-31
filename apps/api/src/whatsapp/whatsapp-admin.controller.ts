import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateWhatsappIntegrationDto } from './dto/update-whatsapp-integration.dto';
import { WhatsappAdminService } from './whatsapp-admin.service';

@Controller('whatsapp/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class WhatsappAdminController {
  constructor(private readonly admin: WhatsappAdminService) {}

  @Get('settings')
  getSettings() {
    return this.admin.getSettings();
  }

  @Patch('settings')
  updateSettings(@Body() dto: UpdateWhatsappIntegrationDto) {
    return this.admin.updateSettings(dto);
  }

  @Get('connect')
  getConnectState() {
    return this.admin.getConnectState();
  }

  @Post('session/logout')
  logout() {
    return this.admin.logout();
  }

  @Post('session/restart')
  restart() {
    return this.admin.restart();
  }
}
