import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SendWhatsappTestMessageDto } from './dto/send-whatsapp-test-message.dto';
import { UpdateWhatsappIntegrationDto } from './dto/update-whatsapp-integration.dto';
import { WhatsappConnectQueryDto } from './dto/whatsapp-connect-query.dto';
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

  @Get('gateway-status')
  getGatewayStatus() {
    return this.admin.getGatewayStatus();
  }

  @Post('test-message')
  sendTestMessage(@Body() dto: SendWhatsappTestMessageDto) {
    return this.admin.sendTestMessage(dto.phone);
  }

  @Get('connect')
  getConnectState(@Query() query: WhatsappConnectQueryDto) {
    return this.admin.getConnectState({ includeQr: query.qr !== undefined });
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
