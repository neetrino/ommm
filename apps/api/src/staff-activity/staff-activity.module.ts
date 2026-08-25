import { Module } from '@nestjs/common';
import { StaffActivityController } from './staff-activity.controller';
import { StaffActivityService } from './staff-activity.service';

@Module({
  controllers: [StaffActivityController],
  providers: [StaffActivityService],
  exports: [StaffActivityService],
})
export class StaffActivityModule {}
