import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import type { AdminListCoachesQueryDto } from './dto/admin-list-coaches-query.dto';
import type { AdminSalarySummariesQueryDto } from './dto/admin-salary-summaries-query.dto';
import type { CreateCoachDto } from './dto/create-coach.dto';
import type { UploadCoachPhotoJsonDto } from './dto/upload-coach-photo-json.dto';
import type { UpdateCoachDto } from './dto/update-coach.dto';
import { CoachesAdminListService } from './coaches-admin-list.service';
import { CoachesAdminWriteService } from './coaches-admin-write.service';
import { CoachesPanelService } from './coaches-panel.service';
import { CoachesPhotoService } from './coaches-photo.service';
import { CoachesPublicService } from './coaches-public.service';

@Injectable()
export class CoachesService {
  constructor(
    private readonly publicService: CoachesPublicService,
    private readonly photoService: CoachesPhotoService,
    private readonly adminWrite: CoachesAdminWriteService,
    private readonly adminList: CoachesAdminListService,
    private readonly panel: CoachesPanelService,
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

  salarySummary(userId: string, month?: string) {
    return this.panel.salarySummary(userId, month);
  }
}
