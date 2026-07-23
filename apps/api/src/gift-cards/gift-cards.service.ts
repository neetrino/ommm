import { Injectable } from '@nestjs/common';
import type { Express } from 'express';
import type { AdminCreateGiftCardDto } from './dto/admin-create-gift-card.dto';
import type { AdminUpdateGiftCardBatchDto } from './dto/admin-update-gift-card-batch.dto';
import type { ListAdminGiftCardBatchesQueryDto } from './dto/list-admin-gift-card-batches-query.dto';
import type { ListMyGiftCardsQueryDto } from './dto/list-my-gift-cards-query.dto';
import { GiftCardsAdminBatchLifecycleService } from './gift-cards-admin-batch-lifecycle.service';
import { GiftCardsAdminBatchWriteService } from './gift-cards-admin-batch-write.service';
import { GiftCardsAdminBoardService } from './gift-cards-admin-board.service';
import { GiftCardsAdminCardsService } from './gift-cards-admin-cards.service';
import { GiftCardsClientService } from './gift-cards-client.service';

@Injectable()
export class GiftCardsService {
  constructor(
    private readonly client: GiftCardsClientService,
    private readonly adminBoard: GiftCardsAdminBoardService,
    private readonly adminCards: GiftCardsAdminCardsService,
    private readonly adminBatchWrite: GiftCardsAdminBatchWriteService,
    private readonly adminBatchLifecycle: GiftCardsAdminBatchLifecycleService,
  ) {}

  listMine(userId: string, query: ListMyGiftCardsQueryDto = {}) {
    return this.client.listMine(userId, query);
  }

  listReceived(userId: string, query: ListMyGiftCardsQueryDto = {}) {
    return this.client.listReceived(userId, query);
  }

  listMarketBatches() {
    return this.client.listMarketBatches();
  }

  redeem(userId: string, code: string) {
    return this.client.redeem(userId, code);
  }

  listAdmin() {
    return this.client.listAdminCards();
  }

  listAdminBoard(query: ListAdminGiftCardBatchesQueryDto = {}) {
    return this.adminBoard.listAdminBoard(query);
  }

  listAssignableUsers() {
    return this.adminCards.listAssignableUsers();
  }

  deactivate(id: string) {
    return this.adminCards.deactivate(id);
  }

  deleteAdminCard(id: string, actorId: string) {
    return this.adminCards.deleteAdminCard(id, actorId);
  }

  resendEmail(id: string) {
    return this.adminCards.resendEmail(id);
  }

  createAdminCard(
    adminId: string,
    dto: AdminCreateGiftCardDto,
    imageFile?: Express.Multer.File,
  ) {
    return this.adminBatchWrite.createAdminCard(adminId, dto, imageFile);
  }

  updateBatch(batchId: string, dto: AdminUpdateGiftCardBatchDto) {
    return this.adminBatchWrite.updateBatch(batchId, dto);
  }

  assignRecipient(giftCardId: string, userId: string) {
    return this.adminCards.assignRecipient(giftCardId, userId);
  }

  assignBatchRecipient(batchId: string, userId: string) {
    return this.adminBatchLifecycle.assignBatchRecipient(batchId, userId);
  }

  deactivateBatch(id: string) {
    return this.adminBatchLifecycle.deactivateBatch(id);
  }

  activateBatch(id: string) {
    return this.adminBatchLifecycle.activateBatch(id);
  }

  deleteBatch(id: string, actorId: string) {
    return this.adminBatchLifecycle.deleteBatch(id, actorId);
  }

  resendBatchEmail(id: string) {
    return this.adminBatchLifecycle.resendBatchEmail(id);
  }

  getBatchHistory(batchId: string) {
    return this.adminBatchLifecycle.getBatchHistory(batchId);
  }

  getRedemptionHistory(giftCardId: string) {
    return this.adminCards.getRedemptionHistory(giftCardId);
  }
}
