import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import {
  BACKOFFICE_DELETE_ROLES,
  BACKOFFICE_WRITE_ROLES,
} from '../common/backoffice-roles';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { RedeemGiftDto } from './dto/redeem-gift.dto';
import { AdminCreateGiftCardDto } from './dto/admin-create-gift-card.dto';
import { AdminAssignGiftCardDto } from './dto/admin-assign-gift-card.dto';
import { AdminUpdateGiftCardBatchDto } from './dto/admin-update-gift-card-batch.dto';
import { ListAdminGiftCardBatchesQueryDto } from './dto/list-admin-gift-card-batches-query.dto';
import { ListMyGiftCardsQueryDto } from './dto/list-my-gift-cards-query.dto';
import { ListGiftRecipientsQueryDto } from './dto/list-gift-recipients-query.dto';
import { GIFT_CARD_IMAGE_MAX_BYTES } from './gift-card-image.constants';
import { GiftCardsService } from './gift-cards.service';

@Controller('gift-cards')
export class GiftCardsController {
  constructor(private readonly giftCards: GiftCardsService) {}

  @Get('me/purchased')
  @UseGuards(JwtAuthGuard)
  purchased(
    @CurrentUser() user: { id: string },
    @Query() query: ListMyGiftCardsQueryDto,
  ) {
    return this.giftCards.listMine(user.id, query);
  }

  @Get('me/received')
  @UseGuards(JwtAuthGuard)
  received(
    @CurrentUser() user: { id: string },
    @Query() query: ListMyGiftCardsQueryDto,
  ) {
    return this.giftCards.listReceived(user.id, query);
  }

  @Get('me/spendable-balance')
  @UseGuards(JwtAuthGuard)
  spendableBalance(@CurrentUser() user: { id: string }) {
    return this.giftCards.getSpendableBalance(user.id);
  }

  @Get('recipients')
  @UseGuards(JwtAuthGuard)
  recipients(
    @CurrentUser() user: { id: string },
    @Query() query: ListGiftRecipientsQueryDto,
  ) {
    return this.giftCards.searchGiftRecipients(user.id, query.q ?? '');
  }

  @Post('redeem')
  @UseGuards(JwtAuthGuard)
  redeem(@CurrentUser() user: { id: string }, @Body() dto: RedeemGiftDto) {
    return this.giftCards.redeem(user.id, dto.code);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  adminList() {
    return this.giftCards.listAdmin();
  }

  @Get('admin/batches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  adminBatchList(@Query() query: ListAdminGiftCardBatchesQueryDto) {
    return this.giftCards.listAdminBoard(query);
  }

  @Get('admin/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  adminUsers() {
    return this.giftCards.listAssignableUsers();
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: GIFT_CARD_IMAGE_MAX_BYTES },
    }),
  )
  adminCreate(
    @CurrentUser() user: { id: string },
    @Body() dto: AdminCreateGiftCardDto,
    @UploadedFile() image: Express.Multer.File | undefined,
  ) {
    return this.giftCards.createAdminCard(user.id, dto, image);
  }

  @Patch('admin/batches/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  updateBatch(
    @Param('id') id: string,
    @Body() dto: AdminUpdateGiftCardBatchDto,
  ) {
    return this.giftCards.updateBatch(id, dto);
  }

  @Patch('admin/:id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  deactivate(@Param('id') id: string) {
    return this.giftCards.deactivate(id);
  }

  @Patch('admin/batches/:id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  deactivateBatch(@Param('id') id: string) {
    return this.giftCards.deactivateBatch(id);
  }

  @Patch('admin/batches/:id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  activateBatch(@Param('id') id: string) {
    return this.giftCards.activateBatch(id);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_DELETE_ROLES)
  deleteAdminCard(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.giftCards.deleteAdminCard(id, user.id);
  }

  @Delete('admin/batches/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_DELETE_ROLES)
  deleteBatch(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.giftCards.deleteBatch(id, user.id);
  }

  @Patch('admin/:id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  assign(@Param('id') id: string, @Body() dto: AdminAssignGiftCardDto) {
    return this.giftCards.assignRecipient(id, dto.userId);
  }

  @Patch('admin/batches/:id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  assignBatch(@Param('id') id: string, @Body() dto: AdminAssignGiftCardDto) {
    return this.giftCards.assignBatchRecipient(id, dto.userId);
  }

  @Post('admin/:id/resend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  resend(@Param('id') id: string) {
    return this.giftCards.resendEmail(id);
  }

  @Post('admin/batches/:id/resend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  resendBatch(@Param('id') id: string) {
    return this.giftCards.resendBatchEmail(id);
  }

  @Get('admin/:id/redemptions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  redemptionHistory(@Param('id') id: string) {
    return this.giftCards.getRedemptionHistory(id);
  }

  @Get('admin/batches/:id/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  batchHistory(@Param('id') id: string) {
    return this.giftCards.getBatchHistory(id);
  }

  @Get('market')
  @UseGuards(JwtAuthGuard)
  market() {
    return this.giftCards.listMarketBatches();
  }
}
