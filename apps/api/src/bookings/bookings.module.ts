import { Module } from '@nestjs/common';
import { PackagesModule } from '../packages/packages.module';
import { ScheduleItemsModule } from '../schedule/schedule.module';
import { WaitlistModule } from '../waitlist/waitlist.module';
import { BookingsAdminManagementService } from './bookings-admin-management.service';
import { BookingsAdminService } from './bookings-admin.service';
import { BookingsClientService } from './bookings-client.service';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingsSlotService } from './bookings-slot.service';

@Module({
  imports: [WaitlistModule, ScheduleItemsModule, PackagesModule],
  controllers: [BookingsController],
  providers: [
    BookingsService,
    BookingsClientService,
    BookingsAdminService,
    BookingsAdminManagementService,
    BookingsSlotService,
  ],
  exports: [BookingsService],
})
export class BookingsModule {}
