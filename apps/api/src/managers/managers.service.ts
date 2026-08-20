import { Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '@prisma/client';
import type { AdminListManagersQueryDto } from './dto/admin-list-managers-query.dto';
import type { CreateManagerDto } from './dto/create-manager.dto';
import type { UpdateManagerDto } from './dto/update-manager.dto';
import { ManagersListService } from './managers-list.service';
import { ManagersWriteService } from './managers-write.service';

@Injectable()
export class ManagersService {
  constructor(
    private readonly listService: ManagersListService,
    private readonly writeService: ManagersWriteService,
  ) {}

  list(actorId: string, query: AdminListManagersQueryDto = {}) {
    return this.listService.list(actorId, query);
  }

  async getById(actorId: string, id: string) {
    const row = await this.listService.getById(actorId, id);
    if (row === null) {
      throw new NotFoundException('Manager not found');
    }
    return row;
  }

  create(actor: User, dto: CreateManagerDto) {
    return this.writeService.create(actor, dto);
  }

  update(actor: User, id: string, dto: UpdateManagerDto) {
    return this.writeService.update(actor, id, dto);
  }

  remove(actor: User, id: string) {
    return this.writeService.remove(actor, id);
  }

  resendInvite(actor: User, id: string) {
    return this.writeService.resendInvite(actor, id);
  }
}
