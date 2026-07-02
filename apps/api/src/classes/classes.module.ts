import { Module } from '@nestjs/common';
import { ScheduleItemsModule } from '../schedule/schedule.module';
import { ClassesController } from './classes.controller';
import { ClassesSessionsAdminService } from './classes-sessions-admin.service';
import { ClassesSessionsPublicService } from './classes-sessions-public.service';
import { ClassesTypesService } from './classes-types.service';
import { ClassesService } from './classes.service';

@Module({
  imports: [ScheduleItemsModule],
  controllers: [ClassesController],
  providers: [
    ClassesTypesService,
    ClassesSessionsPublicService,
    ClassesSessionsAdminService,
    ClassesService,
  ],
  exports: [ClassesService],
})
export class ClassesModule {}
