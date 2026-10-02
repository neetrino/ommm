import { Module } from '@nestjs/common';
import { R2HomeImageStorage } from '../storage/r2-home-image.storage';
import { GiftCardsAdminCardOpsService } from './gift-cards-admin-card-ops.service';
import { GiftCardsAdminBatchLifecycleService } from './gift-cards-admin-batch-lifecycle.service';
import { GiftCardRedeemGuardService } from './gift-card-redeem-guard.service';
import { GiftCardsAdminBatchWriteService } from './gift-cards-admin-batch-write.service';
import { GiftCardsAdminImportService } from './gift-cards-admin-import.service';
import { GiftCardsImportController } from './gift-cards-import.controller';
import { GiftCardsAdminBoardService } from './gift-cards-admin-board.service';
import { GiftCardsAdminCardsService } from './gift-cards-admin-cards.service';
import { GiftCardsClientService } from './gift-cards-client.service';
import { GiftCardsController } from './gift-cards.controller';
import { GiftCardsImageService } from './gift-cards-image.service';
import { GiftCardsService } from './gift-cards.service';

@Module({
  controllers: [GiftCardsImportController, GiftCardsController],
  providers: [
    GiftCardsService,
    GiftCardsAdminImportService,
    GiftCardsClientService,
    GiftCardsAdminBoardService,
    GiftCardsAdminCardsService,
    GiftCardsAdminBatchWriteService,
    GiftCardsAdminBatchLifecycleService,
    GiftCardsAdminCardOpsService,
    GiftCardRedeemGuardService,
    GiftCardsImageService,
    R2HomeImageStorage,
  ],
})
export class GiftCardsModule {}
