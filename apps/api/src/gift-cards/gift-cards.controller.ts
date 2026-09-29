import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
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
import { AdminAdjustGiftCardDto, AdminExtendGiftCardDto } from './dto/admin-adjust-gift-card.dto';
import { AdminConvertGiftCardDto } from './dto/admin-convert-gift-card.dto';
import { AdminAllowOtherClassesDto } from './dto/admin-allow-other-classes.dto';
import { AdminUpdateGiftCardBatchDto } from './dto/admin-update-gift-card-batch.dto';
import { ListAdminGiftCardBatchesQueryDto } from './dto/list-admin-gift-card-batches-query.dto';
import { ListMyGiftCardsQueryDto } from './dto/list-my-gift-cards-query.dto';
import { ListGiftRecipientsQueryDto } from './dto/list-gift-recipients-query.dto';
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

  @Get('me/activity')
  @UseGuards(JwtAuthGuard)
  activity(@CurrentUser() user: { id: string }) {
    return this.giftCards.listMyActivity(user.id);
  }

  @Get('me/:id/pdf')
  @UseGuards(JwtAuthGuard)
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="ommm-gift-card.pdf"')
  async pdf(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ): Promise<StreamableFile> {
    const bytes = await this.giftCards.buildPdf(user.id, id);
    return new StreamableFile(bytes);
  }

  @Get('policy')
  @UseGuards(JwtAuthGuard)
  policy() {
    return this.giftCards.getPolicy();
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
  adminCreate(
    @CurrentUser() user: { id: string },
    @Body() dto: AdminCreateGiftCardDto,
  ) {
    return this.giftCards.createAdminCard(user.id, dto);
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

  @Get('admin/batches/:id/export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  async exportBatch(@Param('id') id: string, @Res() res: Response) {
    const csv = await this.giftCards.exportBatchCsv(id);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="gift-cards-${id}.csv"`);
    res.send(csv);
  }

  @Patch('admin/cards/:id/expires')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  extendCard(@Param('id') id: string, @Body() dto: AdminExtendGiftCardDto) {
    return this.giftCards.extendCardExpiry(id, dto);
  }

  @Post('admin/cards/:id/convert')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  convertCard(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: AdminConvertGiftCardDto,
  ) {
    return this.giftCards.convertCard(id, dto.direction, dto.classTypeId, user.id);
  }

  @Patch('admin/cards/:id/other-classes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  allowOtherClasses(@Param('id') id: string, @Body() dto: AdminAllowOtherClassesDto) {
    return this.giftCards.setAllowOtherClasses(id, dto.allow);
  }

  @Patch('admin/cards/:id/balance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...BACKOFFICE_WRITE_ROLES)
  adjustCard(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: AdminAdjustGiftCardDto,
  ) {
    return this.giftCards.adjustCardBalance(id, dto, user.id);
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
