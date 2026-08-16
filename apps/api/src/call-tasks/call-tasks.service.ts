import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CallTaskStatus, Prisma } from '@prisma/client';
import {
  DEFAULT_LIST_PAGE_SIZE,
} from '../common/dto/list-pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { dueOnFilterCutoff, parseCallTaskDueOn } from './call-tasks-due.util';
import { toCallTaskDto } from './call-tasks.mapper';
import type { CreateCallTaskDto } from './dto/create-call-task.dto';
import type {
  CallTaskListOrder,
  ListCallTasksQueryDto,
} from './dto/list-call-tasks-query.dto';
import type { UpdateCallTaskDto } from './dto/update-call-task.dto';

const DUE_LIST_TAKE = 50;

@Injectable()
export class CallTasksService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListCallTasksQueryDto) {
    const take = query.take ?? DEFAULT_LIST_PAGE_SIZE;
    const offset = query.offset ?? 0;
    const where = this.buildListWhere(query);
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.callTask.count({ where }),
      this.prisma.callTask.findMany({
        where,
        orderBy: this.listOrderBy(query.order),
        take,
        skip: offset,
      }),
    ]);
    return { items: rows.map((row) => toCallTaskDto(row)), total, take, offset };
  }

  async listDue() {
    const cutoff = dueOnFilterCutoff();
    const rows = await this.prisma.callTask.findMany({
      where: { status: CallTaskStatus.PENDING, dueOn: { lte: cutoff } },
      orderBy: [{ dueOn: 'asc' }, { createdAt: 'asc' }],
      take: DUE_LIST_TAKE,
    });
    return { items: rows.map((row) => toCallTaskDto(row)), total: rows.length };
  }

  async countPending() {
    const count = await this.prisma.callTask.count({
      where: { status: CallTaskStatus.PENDING },
    });
    return { count };
  }

  async create(createdById: string, dto: CreateCallTaskDto) {
    await this.assertOptionalUser(dto.userId);
    const row = await this.prisma.callTask.create({
      data: {
        contactName: dto.contactName.trim(),
        phone: dto.phone.trim(),
        comment: dto.comment.trim(),
        dueOn: parseCallTaskDueOn(dto.dueOn),
        userId: dto.userId,
        createdById,
      },
    });
    return toCallTaskDto(row);
  }

  async update(id: string, dto: UpdateCallTaskDto) {
    const existing = await this.requirePending(id);
    if (dto.userId !== undefined && dto.userId !== null && dto.userId !== '') {
      await this.assertOptionalUser(dto.userId);
    }
    const row = await this.prisma.callTask.update({
      where: { id: existing.id },
      data: this.buildUpdateData(dto),
    });
    return toCallTaskDto(row);
  }

  async complete(id: string) {
    const existing = await this.requirePending(id);
    const row = await this.prisma.callTask.update({
      where: { id: existing.id },
      data: { status: CallTaskStatus.DONE, completedAt: new Date() },
    });
    return toCallTaskDto(row);
  }

  async cancel(id: string) {
    const existing = await this.requirePending(id);
    const row = await this.prisma.callTask.update({
      where: { id: existing.id },
      data: { status: CallTaskStatus.CANCELLED, completedAt: null },
    });
    return toCallTaskDto(row);
  }

  private buildListWhere(query: ListCallTasksQueryDto): Prisma.CallTaskWhereInput {
    const q = query.q?.trim();
    const search = q
      ? {
          OR: [
            { contactName: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { phone: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { comment: { contains: q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};
    return {
      ...(query.status ? { status: query.status } : {}),
      ...search,
    };
  }

  private listOrderBy(
    order: CallTaskListOrder | undefined,
  ): Prisma.CallTaskOrderByWithRelationInput[] {
    if (order === 'due-desc') {
      return [{ dueOn: 'desc' }, { createdAt: 'desc' }];
    }
    if (order === 'newest') {
      return [{ createdAt: 'desc' }];
    }
    return [{ dueOn: 'asc' }, { createdAt: 'asc' }];
  }

  private buildUpdateData(dto: UpdateCallTaskDto): Prisma.CallTaskUpdateInput {
    return {
      ...(dto.contactName !== undefined
        ? { contactName: dto.contactName.trim() }
        : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone.trim() } : {}),
      ...(dto.comment !== undefined ? { comment: dto.comment.trim() } : {}),
      ...(dto.dueOn !== undefined ? { dueOn: parseCallTaskDueOn(dto.dueOn) } : {}),
      ...(dto.userId !== undefined
        ? { userId: dto.userId === '' || dto.userId === null ? null : dto.userId }
        : {}),
    };
  }

  private async requirePending(id: string) {
    const row = await this.prisma.callTask.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException('Call task not found');
    }
    if (row.status !== CallTaskStatus.PENDING) {
      throw new ConflictException('Only pending call tasks can be changed');
    }
    return row;
  }

  private async assertOptionalUser(userId: string | undefined) {
    if (!userId) {
      return;
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user) {
      throw new BadRequestException('Linked client was not found');
    }
  }
}
