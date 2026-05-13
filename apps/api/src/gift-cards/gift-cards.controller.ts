import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { RedeemGiftDto } from './dto/redeem-gift.dto';
import { AdminCreateGiftCardDto } from './dto/admin-create-gift-card.dto';
import { GiftCardsService } from './gift-cards.service';

@Controller('gift-cards')
export class GiftCardsController {
  constructor(private readonly giftCards: GiftCardsService) {}

  @Get('me/purchased')
  @UseGuards(JwtAuthGuard)
  purchased(@CurrentUser() user: { id: string }) {
    return this.giftCards.listMine(user.id);
  }

  @Get('me/received')
  @UseGuards(JwtAuthGuard)
  received(@CurrentUser() user: { id: string }) {
    return this.giftCards.listReceived(user.id);
  }

  @Post('redeem')
  @UseGuards(JwtAuthGuard)
  redeem(@CurrentUser() user: { id: string }, @Body() dto: RedeemGiftDto) {
    return this.giftCards.redeem(user.id, dto.code);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  adminList() {
    return this.giftCards.listAdmin();
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  adminCreate(
    @CurrentUser() user: { id: string },
    @Body() dto: AdminCreateGiftCardDto,
  ) {
    return this.giftCards.createAdminCard(user.id, dto);
  }

  @Patch('admin/:id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deactivate(@Param('id') id: string) {
    return this.giftCards.deactivate(id);
  }

  @Post('admin/:id/resend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  resend(@Param('id') id: string) {
    return this.giftCards.resendEmail(id);
  }
}
