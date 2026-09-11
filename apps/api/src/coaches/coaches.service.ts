import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import type { AdminListCoachesQueryDto } from './dto/admin-list-coaches-query.dto';
import type { AdminSalaryPayoutsQueryDto } from './dto/admin-salary-payouts-query.dto';
import type { AdminSalarySummariesQueryDto } from './dto/admin-salary-summaries-query.dto';
import type { CoachSalarySessionsQueryDto } from './dto/coach-salary-sessions-query.dto';
import type { CreateCoachDto } from './dto/create-coach.dto';
import type { UploadCoachPhotoJsonDto } from './dto/upload-coach-photo-json.dto';
import type { UpdateCoachDto } from './dto/update-coach.dto';
import { CoachesAdminListService } from './coaches-admin-list.service';
import { CoachesAdminWriteService } from './coaches-admin-write.service';
import { CoachesPanelSessionsService } from './coaches-panel-sessions.service';
import { CoachesPanelService } from './coaches-panel.service';
import { CoachesPhotoService } from './coaches-photo.service';
import { CoachesPublicService } from './coaches-public.service';
import { CoachSalaryPayoutService } from './coaches-salary-payout.service';
import { CoachSalarySessionsService } from './coaches-salary-sessions.service';

@Injectable()
export class CoachesService {
  constructor(
    private readonly publicService: CoachesPublicService,
    private readonly photoService: CoachesPhotoService,
    private readonly adminWrite: CoachesAdminWriteService,
    private readonly adminList: CoachesAdminListService,
    private readonly panel: CoachesPanelService,
    private readonly panelSessions: CoachesPanelSessionsService,
    private readonly salaryPayout: CoachSalaryPayoutService,
    private readonly salarySessions: CoachSalarySessionsService,
  ) {}

  listPublic() {
    return this.publicService.listPublic();
  }

  getPublic(id: string) {
    return this.publicService.getPublic(id);
  }

  create(dto: CreateCoachDto) {
    return this.adminWrite.create(dto);
  }

  uploadCoachPhotoJson(coachProfileId: string, dto: UploadCoachPhotoJsonDto) {
    return this.photoService.uploadCoachPhotoJson(coachProfileId, dto);
  }

  update(actor: User, coachProfileId: string, dto: UpdateCoachDto) {
    return this.adminWrite.update(actor, coachProfileId, dto);
  }

  remove(actor: User, coachProfileId: string) {
    return this.adminWrite.remove(actor, coachProfileId);
  }

  listAdmin(query: AdminListCoachesQueryDto = {}) {
    return this.adminList.listAdmin(query);
  }

  coachPanelSummary(userId: string) {
    return this.panel.coachPanelSummary(userId);
  }

  adminSalarySummaries(query: AdminSalarySummariesQueryDto = {}) {
    return this.panel.adminSalarySummaries(query);
  }

  adminSalaryPayouts(query: AdminSalaryPayoutsQueryDto = {}) {
    return this.salaryPayout.listAdmin(query);
  }

  salarySummary(userId: string, month?: string) {
    return this.panel.salarySummary(userId, month);
  }

  markSalaryPaid(actor: User, coachProfileId: string, month: string) {
    return this.salaryPayout.markMonthPaid(actor, coachProfileId, month);
  }

  adminSalarySessions(
    coachProfileId: string,
    query: CoachSalarySessionsQueryDto = {},
  ) {
    return this.salarySessions.listForCoach(coachProfileId, query);
  }

  panelSalarySessions(userId: string, query: CoachSalarySessionsQueryDto = {}) {
    return this.salarySessions.listForUser(userId, query);
  }

  async panelSessionsList(userId: string) {
    return (await this.panelSessions.listForUser(userId)) ?? [];
  }
}
