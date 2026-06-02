import { Module } from '@nestjs/common';
import { ScheduleItemsModule } from '../schedule/schedule.module';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';

@Module({
  imports: [ScheduleItemsModule],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
