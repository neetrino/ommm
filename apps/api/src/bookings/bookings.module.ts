import { Module } from '@nestjs/common';
import { PackagesModule } from '../packages/packages.module';
import { WaitlistModule } from '../waitlist/waitlist.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [WaitlistModule, PackagesModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
