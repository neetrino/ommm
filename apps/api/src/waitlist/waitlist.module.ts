import { Module } from '@nestjs/common';
import { ScheduleItemsModule } from '../schedule/schedule.module';
import { StudioModule } from '../studio/studio.module';
import { WaitlistController } from './waitlist.controller';
import { WaitlistService } from './waitlist.service';

@Module({
  imports: [StudioModule, ScheduleItemsModule],
  controllers: [WaitlistController],
  providers: [WaitlistService],
  exports: [WaitlistService],
})
export class WaitlistModule {}
