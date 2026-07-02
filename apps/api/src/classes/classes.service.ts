import { Injectable } from '@nestjs/common';
import { ClassSessionStatus } from '@prisma/client';
import { ClassesSessionsAdminService } from './classes-sessions-admin.service';
import { ClassesSessionsPublicService } from './classes-sessions-public.service';
import { ClassesTypesService } from './classes-types.service';
import type { AdminListSessionsQueryDto } from './dto/admin-list-sessions-query.dto';
import type { CreateClassTypeDto } from './dto/create-class-type.dto';
import type { CreateSessionBatchDto } from './dto/create-session-batch.dto';
import type { CreateSessionDto } from './dto/create-session.dto';
import type { UpdateClassTypeDto } from './dto/update-class-type.dto';
import type { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class ClassesService {
  constructor(
    private readonly typesService: ClassesTypesService,
    private readonly sessionsPublicService: ClassesSessionsPublicService,
    private readonly sessionsAdminService: ClassesSessionsAdminService,
  ) {}

  listTypes() {
    return this.typesService.listTypes();
  }

  createType(dto: CreateClassTypeDto) {
    return this.typesService.createType(dto);
  }

  updateType(id: string, dto: UpdateClassTypeDto) {
    return this.typesService.updateType(id, dto);
  }

  deleteType(id: string) {
    return this.typesService.deleteType(id);
  }

  listSessionsPublic(params: {
    from: Date;
    to?: Date;
    coachId?: string;
    typeId?: string;
  }) {
    return this.sessionsPublicService.listSessionsPublic(params);
  }

  getSessionPublic(id: string) {
    return this.sessionsPublicService.getSessionPublic(id);
  }

  listSessionsAdmin(query: AdminListSessionsQueryDto) {
    return this.sessionsAdminService.listSessionsAdmin(query);
  }

  createSession(dto: CreateSessionDto) {
    return this.sessionsAdminService.createSession(dto);
  }

  createSessionBatch(dto: CreateSessionBatchDto) {
    return this.sessionsAdminService.createSessionBatch(dto);
  }

  updateSession(id: string, dto: UpdateSessionDto) {
    return this.sessionsAdminService.updateSession(id, dto);
  }

  updateSessionStatus(id: string, status: ClassSessionStatus) {
    return this.sessionsAdminService.updateSessionStatus(id, status);
  }

  cancelSession(id: string) {
    return this.sessionsAdminService.cancelSession(id);
  }

  deleteSession(id: string) {
    return this.sessionsAdminService.deleteSession(id);
  }
}
