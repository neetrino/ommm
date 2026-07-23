import { Module } from '@nestjs/common';
import { R2HomeImageStorage } from '../storage/r2-home-image.storage';
import { GiftCardsAdminBatchLifecycleService } from './gift-cards-admin-batch-lifecycle.service';
import { GiftCardsAdminBatchWriteService } from './gift-cards-admin-batch-write.service';
import { GiftCardsAdminBoardService } from './gift-cards-admin-board.service';
import { GiftCardsAdminCardsService } from './gift-cards-admin-cards.service';
import { GiftCardsClientService } from './gift-cards-client.service';
import { GiftCardsController } from './gift-cards.controller';
import { GiftCardsImageService } from './gift-cards-image.service';
import { GiftCardsService } from './gift-cards.service';

@Module({
  controllers: [GiftCardsController],
  providers: [
    GiftCardsService,
    GiftCardsClientService,
    GiftCardsAdminBoardService,
    GiftCardsAdminCardsService,
    GiftCardsAdminBatchWriteService,
    GiftCardsAdminBatchLifecycleService,
    GiftCardsImageService,
    R2HomeImageStorage,
  ],
})
export class GiftCardsModule {}
