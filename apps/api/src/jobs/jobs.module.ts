import { Module } from '@nestjs/common';
import { BookingsModule } from '../bookings/bookings.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';
import { WaitlistModule } from '../waitlist/waitlist.module';
import { CronBatchService } from './cron-batch.service';

@Module({
  imports: [
    WaitlistModule,
    BookingsModule,
    NotificationsModule,
    PaymentsModule,
  ],
  providers: [CronBatchService],
})
export class JobsModule {}
