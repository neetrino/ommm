import { Module } from '@nestjs/common';
import { ScheduleItemsModule } from '../schedule/schedule.module';
import { StaffActivityModule } from '../staff-activity/staff-activity.module';
import { StudioModule } from '../studio/studio.module';
import { WaitlistAdminListService } from './waitlist-admin-list.service';
import { WaitlistAdminService } from './waitlist-admin.service';
import { WaitlistCapacityService } from './waitlist-capacity.service';
import { WaitlistClientService } from './waitlist-client.service';
import { WaitlistController } from './waitlist.controller';
import { WaitlistOffersService } from './waitlist-offers.service';
import { WaitlistService } from './waitlist.service';

@Module({
  imports: [StudioModule, ScheduleItemsModule, StaffActivityModule],
  controllers: [WaitlistController],
  providers: [
    WaitlistService,
    WaitlistCapacityService,
    WaitlistClientService,
    WaitlistAdminService,
    WaitlistAdminListService,
    WaitlistOffersService,
  ],
  exports: [WaitlistService],
})
export class WaitlistModule {}
