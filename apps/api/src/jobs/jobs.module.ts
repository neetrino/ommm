import { Module } from '@nestjs/common';
import { BookingsModule } from '../bookings/bookings.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PackagesModule } from '../packages/packages.module';
import { PaymentsModule } from '../payments/payments.module';
import { WaitlistModule } from '../waitlist/waitlist.module';
import { CronBatchService } from './cron-batch.service';

@Module({
  imports: [
    WaitlistModule,
    BookingsModule,
    NotificationsModule,
    PaymentsModule,
    PackagesModule,
  ],
  providers: [CronBatchService],
})
export class JobsModule {}
