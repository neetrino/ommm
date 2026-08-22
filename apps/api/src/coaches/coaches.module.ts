import { Module } from '@nestjs/common';
import { R2HomeImageStorage } from '../storage/r2-home-image.storage';
import { CoachesAdminListService } from './coaches-admin-list.service';
import { CoachesAdminWriteService } from './coaches-admin-write.service';
import { CoachesPanelService } from './coaches-panel.service';
import { CoachesPhotoService } from './coaches-photo.service';
import { CoachesPublicService } from './coaches-public.service';
import { CoachSalaryAccrualService } from './coaches-salary-accrual.service';
import { CoachSalaryPayoutService } from './coaches-salary-payout.service';
import { CoachSalarySummaryService } from './coaches-salary-summary.service';
import { CoachesController } from './coaches.controller';
import { CoachesService } from './coaches.service';

@Module({
  controllers: [CoachesController],
  providers: [
    CoachesService,
    CoachesPublicService,
    CoachesPhotoService,
    CoachesAdminWriteService,
    CoachesAdminListService,
    CoachesPanelService,
    CoachSalaryAccrualService,
    CoachSalaryPayoutService,
    CoachSalarySummaryService,
    R2HomeImageStorage,
  ],
  exports: [CoachesService, CoachSalaryAccrualService],
})
export class CoachesModule {}
