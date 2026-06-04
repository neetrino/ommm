import { Module } from '@nestjs/common';
import { R2HomeImageStorage } from '../storage/r2-home-image.storage';
import { GiftCardsController } from './gift-cards.controller';
import { GiftCardsService } from './gift-cards.service';

@Module({
  controllers: [GiftCardsController],
  providers: [GiftCardsService, R2HomeImageStorage],
})
export class GiftCardsModule {}
