import { Global, Module } from '@nestjs/common';
import { BookingCancelIntentService } from './booking-cancel-intent.service';
import { RedisCacheService } from './redis-cache.service';

@Global()
@Module({
  providers: [RedisCacheService, BookingCancelIntentService],
  exports: [RedisCacheService, BookingCancelIntentService],
})
export class CacheModule {}
