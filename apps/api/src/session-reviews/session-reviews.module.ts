import { Module } from '@nestjs/common';
import { SessionReviewsController } from './session-reviews.controller';
import { SessionReviewsService } from './session-reviews.service';

@Module({
  controllers: [SessionReviewsController],
  providers: [SessionReviewsService],
})
export class SessionReviewsModule {}
