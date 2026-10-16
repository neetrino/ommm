import { Module } from '@nestjs/common';
import { CouponsAdminService } from './coupons-admin.service';
import { CouponsAnalyticsService } from './coupons-analytics.service';
import { CouponsController } from './coupons.controller';

@Module({
  controllers: [CouponsController],
  providers: [CouponsAdminService, CouponsAnalyticsService],
})
export class CouponsModule {}
