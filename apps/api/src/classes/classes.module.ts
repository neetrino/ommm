import { Module } from '@nestjs/common';
import { BookingsModule } from '../bookings/bookings.module';
import { ScheduleItemsModule } from '../schedule/schedule.module';
import { WaitlistModule } from '../waitlist/waitlist.module';
import { ClassesController } from './classes.controller';
import { ClassCancelledEmailService } from './class-cancelled-email.service';
import { ClassesSessionCancelCascadeService } from './classes-session-cancel-cascade.service';
import { ClassesSessionsAdminService } from './classes-sessions-admin.service';
import { ClassesSessionsPublicService } from './classes-sessions-public.service';
import { ClassesTypesService } from './classes-types.service';
import { ClassesService } from './classes.service';

@Module({
  imports: [ScheduleItemsModule, BookingsModule, WaitlistModule],
  controllers: [ClassesController],
  providers: [
    ClassesTypesService,
    ClassesSessionsPublicService,
    ClassCancelledEmailService,
    ClassesSessionCancelCascadeService,
    ClassesSessionsAdminService,
    ClassesService,
  ],
  exports: [ClassesService],
})
export class ClassesModule {}
