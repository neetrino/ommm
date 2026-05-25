import { Module } from '@nestjs/common';
import { R2HomeImageStorage } from '../storage/r2-home-image.storage';
import { CoachesController } from './coaches.controller';
import { CoachesService } from './coaches.service';

@Module({
  controllers: [CoachesController],
  providers: [CoachesService, R2HomeImageStorage],
  exports: [CoachesService],
})
export class CoachesModule {}
