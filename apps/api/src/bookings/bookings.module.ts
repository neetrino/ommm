import { Module } from '@nestjs/common';
import { PackagesModule } from '../packages/packages.module';
import { ScheduleItemsModule } from '../schedule/schedule.module';
import { StaffActivityModule } from '../staff-activity/staff-activity.module';
import { WaitlistModule } from '../waitlist/waitlist.module';
import { CoachesModule } from '../coaches/coaches.module';
import { BookingsAdminListService } from './bookings-admin-list.service';
import { BookingsAdminManagementService } from './bookings-admin-management.service';
import { BookingsAdminService } from './bookings-admin.service';
import { BookingsClientListService } from './bookings-client-list.service';
import { BookingsClientService } from './bookings-client.service';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingsSlotService } from './bookings-slot.service';
import { BookingsStatusTransitionService } from './bookings-status-transition.service';

@Module({
  imports: [
    WaitlistModule,
    ScheduleItemsModule,
    PackagesModule,
    CoachesModule,
    StaffActivityModule,
  ],
  controllers: [BookingsController],
  providers: [
    BookingsService,
    BookingsClientService,
    BookingsClientListService,
    BookingsAdminService,
    BookingsAdminListService,
    BookingsAdminManagementService,
    BookingsSlotService,
    BookingsStatusTransitionService,
  ],
  exports: [
    BookingsService,
    BookingsStatusTransitionService,
    BookingsSlotService,
  ],
})
export class BookingsModule {}
