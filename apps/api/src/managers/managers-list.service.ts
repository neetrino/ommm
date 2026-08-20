import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AdminManagerOrder } from './managers-list.constants';
import type { AdminListManagersQueryDto } from './dto/admin-list-managers-query.dto';
import { managerListSelect, toManagerDirectoryRow } from './managers.mapper';
import { buildManagersListWhere } from './managers-list.where';
import type { ManagerListPayload } from './managers.types';

@Injectable()
export class ManagersListService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    actorId: string,
    query: AdminListManagersQueryDto = {},
  ): Promise<ManagerListPayload> {
    const where = buildManagersListWhere(query);
    const take = query.take ?? DEFAULT_LIST_PAGE_SIZE;
    const offset = query.offset ?? 0;
    const [rows, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: managerListSelect,
        orderBy: {
          createdAt: query.order === AdminManagerOrder.OLDEST ? 'asc' : 'desc',
        },
        take,
        skip: offset,
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      items: rows.map((row) => toManagerDirectoryRow(row, actorId)),
      total,
      take,
      offset,
    };
  }

  async getById(actorId: string, id: string) {
    const row = await this.prisma.user.findFirst({
      where: { id, role: Role.MANAGER },
      select: managerListSelect,
    });
    if (row === null) {
      return null;
    }
    return toManagerDirectoryRow(row, actorId);
  }
}
