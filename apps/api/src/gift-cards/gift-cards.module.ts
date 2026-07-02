import { Module } from '@nestjs/common';
import { R2HomeImageStorage } from '../storage/r2-home-image.storage';
import { GiftCardsAdminBatchService } from './gift-cards-admin-batch.service';
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
    GiftCardsAdminBatchService,
    GiftCardsImageService,
    R2HomeImageStorage,
  ],
})
export class GiftCardsModule {}
