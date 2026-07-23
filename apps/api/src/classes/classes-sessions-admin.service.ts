import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClassSessionStatus } from '@prisma/client';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import {
  resolveSessionListOrderBy,
  sortAdminSessionRows,
  SessionListOrder,
} from '../common/list-order.helpers';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimePublisherService } from '../realtime/realtime-publisher.service';
import { ScheduleService } from '../schedule/schedule.service';
import {
  ADMIN_SESSION_INCLUDE,
  assertTimeRange,
  buildBatchSessionData,
  buildRecurrencePayloadForCreate,
  buildRecurrencePayloadForUpdate,
  mapAdminSessionRows,
  normalizeOptional,
  type AdminSessionRow,
  type ClassSessionWithRecurrence,
} from './classes-session.helpers';
import {
  buildSessionsListWhere,
  filterSessionRows,
  normalizeSessionsListQuery,
  paginateSessionRows,
  requiresSessionsPostProcessing,
  SESSIONS_FILTER_SCAN_LIMIT,
  type AdminSessionsListPage,
} from './classes-sessions-list-filters';
import { ClassesTypesService } from './classes-types.service';
import type { AdminListSessionsQueryDto } from './dto/admin-list-sessions-query.dto';
import type { CreateSessionBatchDto } from './dto/create-session-batch.dto';
import type { CreateSessionDto } from './dto/create-session.dto';
import type { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class ClassesSessionsAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly typesService: ClassesTypesService,
    private readonly schedule: ScheduleService,
    private readonly realtime: RealtimePublisherService,
  ) {}

  async listSessionsAdmin(
    query: AdminListSessionsQueryDto,
  ): Promise<AdminSessionRow[] | AdminSessionsListPage<AdminSessionRow>> {
    const normalizedQuery = normalizeSessionsListQuery(query);
    const hasPagination =
      normalizedQuery.take !== undefined ||
      normalizedQuery.offset !== undefined;
    const where = buildSessionsListWhere(normalizedQuery);
    const sessionOrder = resolveSessionListOrderBy(
      normalizedQuery.order ?? SessionListOrder.UPCOMING,
    );
    const findArgs = {
      where,
      include: ADMIN_SESSION_INCLUDE,
      orderBy: sessionOrder,
    };

    if (!hasPagination) {
      const sessions = await this.prisma.classSession.findMany(findArgs);
      return mapAdminSessionRows(sessions);
    }

    const take = normalizedQuery.take ?? DEFAULT_LIST_PAGE_SIZE;
    const offset = normalizedQuery.offset ?? 0;

    if (requiresSessionsPostProcessing(normalizedQuery)) {
      const sessions = await this.prisma.classSession.findMany({
        ...findArgs,
        take: SESSIONS_FILTER_SCAN_LIMIT,
      });
      const mapped = mapAdminSessionRows(sessions);
      const filtered = filterSessionRows(mapped, normalizedQuery);
      const sorted = sortAdminSessionRows(
        filtered,
        normalizedQuery.order ?? SessionListOrder.UPCOMING,
      );
      return paginateSessionRows(sorted, take, offset);
    }

    const [sessions, total, dateStripRows] = await Promise.all([
      this.prisma.classSession.findMany({ ...findArgs, take, skip: offset }),
      this.prisma.classSession.count({ where }),
      this.prisma.classSession.findMany({
        where,
        select: { startsAt: true },
      }),
    ]);
    return {
      items: mapAdminSessionRows(sessions),
      total,
      take,
      offset,
      dateStripStartsAt: dateStripRows.map((row) => row.startsAt.toISOString()),
    };
  }

  async createSession(dto: CreateSessionDto): Promise<AdminSessionRow> {
    await this.typesService.assertClassTypeExists(dto.classTypeId);
    await this.assertCoachAssignedToClassType(dto.coachId, dto.classTypeId);
    if (dto.substituteCoachId) {
      await this.assertCoachAssignedToClassType(
        dto.substituteCoachId,
        dto.classTypeId,
      );
    }
    const recurrence = buildRecurrencePayloadForCreate(dto);
    const title = await this.typesService.resolveSessionTitle(
      dto.title,
      dto.classTypeId,
    );
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);
    assertTimeRange(startsAt, endsAt);
    const created = await this.prisma.classSession.create({
      data: {
        title,
        description: normalizeOptional(dto.description),
        classTypeId: dto.classTypeId,
        coachId: dto.coachId,
        substituteCoachId: dto.substituteCoachId,
        startsAt,
        endsAt,
        capacity: dto.capacity,
        level: normalizeOptional(dto.level),
        classFormat: normalizeOptional(dto.classFormat),
        priceCents: dto.priceCents ?? 0,
        sessionRequirement: dto.sessionRequirement ?? null,
        status: dto.status ?? ClassSessionStatus.ACTIVE,
        recurrencePattern: recurrence.recurrencePattern,
        recurrenceWeekdays: recurrence.recurrenceWeekdays,
        recurrenceEndsAt: recurrence.recurrenceEndsAt,
        recurrenceCount: recurrence.recurrenceCount,
      },
    });
    await this.invalidatePublicScheduleAndEmit(created.id);
    return this.findSessionAdminOrThrow(created.id);
  }

  async createSessionBatch(
    dto: CreateSessionBatchDto,
  ): Promise<AdminSessionRow[]> {
    await this.typesService.assertClassTypeExists(dto.classTypeId);
    await this.assertCoachAssignedToClassType(dto.coachId, dto.classTypeId);
    const title = await this.typesService.resolveSessionTitle(
      dto.title,
      dto.classTypeId,
    );
    const createRows = buildBatchSessionData(dto, title);
    const created = await this.prisma.$transaction(
      createRows.map((data) => this.prisma.classSession.create({ data })),
    );
    await Promise.all(
      created.map((session) =>
        this.invalidatePublicScheduleAndEmit(session.id),
      ),
    );
    return Promise.all(
      created.map((session) => this.findSessionAdminOrThrow(session.id)),
    );
  }

  async updateSession(
    id: string,
    dto: UpdateSessionDto,
  ): Promise<AdminSessionRow> {
    const existingRaw = await this.prisma.classSession.findUnique({
      where: { id },
    });
    if (!existingRaw) {
      throw new NotFoundException('Session not found');
    }
    const existing = existingRaw as ClassSessionWithRecurrence;

    const nextClassTypeId = dto.classTypeId ?? existing.classTypeId;
    const nextCoachId = dto.coachId ?? existing.coachId;
    await this.typesService.assertClassTypeExists(nextClassTypeId);
    await this.assertCoachAssignedToClassType(nextCoachId, nextClassTypeId);
    if (dto.substituteCoachId) {
      await this.assertCoachAssignedToClassType(
        dto.substituteCoachId,
        nextClassTypeId,
      );
    }

    const startsAt = dto.startsAt ? new Date(dto.startsAt) : existing.startsAt;
    const endsAt = dto.endsAt ? new Date(dto.endsAt) : existing.endsAt;
    const recurrence = buildRecurrencePayloadForUpdate(dto, existing);
    assertTimeRange(startsAt, endsAt);

    await this.prisma.classSession.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title.trim() }),
        ...(dto.description !== undefined && {
          description: normalizeOptional(dto.description),
        }),
        ...(dto.classTypeId !== undefined && { classTypeId: dto.classTypeId }),
        ...(dto.coachId !== undefined && { coachId: dto.coachId }),
        ...(dto.substituteCoachId !== undefined && {
          substituteCoachId: normalizeOptional(dto.substituteCoachId),
        }),
        ...(dto.startsAt !== undefined && { startsAt }),
        ...(dto.endsAt !== undefined && { endsAt }),
        ...(dto.capacity !== undefined && { capacity: dto.capacity }),
        ...(dto.level !== undefined && {
          level: normalizeOptional(dto.level),
        }),
        ...(dto.classFormat !== undefined && {
          classFormat: normalizeOptional(dto.classFormat),
        }),
        ...(dto.priceCents !== undefined && { priceCents: dto.priceCents }),
        ...(dto.sessionRequirement !== undefined && {
          sessionRequirement: dto.sessionRequirement,
        }),
        ...(dto.status !== undefined && { status: dto.status }),
        recurrencePattern: recurrence.recurrencePattern,
        recurrenceWeekdays: recurrence.recurrenceWeekdays,
        recurrenceEndsAt: recurrence.recurrenceEndsAt,
        recurrenceCount: recurrence.recurrenceCount,
      },
    });
    await this.invalidatePublicScheduleAndEmit(id);
    return this.findSessionAdminOrThrow(id);
  }

  async updateSessionStatus(id: string, status: ClassSessionStatus) {
    const s = await this.prisma.classSession.findUnique({ where: { id } });
    if (!s) throw new NotFoundException();
    await this.prisma.classSession.update({
      where: { id },
      data: { status },
    });
    await this.invalidatePublicScheduleAndEmit(id);
    return this.findSessionAdminOrThrow(id);
  }

  async cancelSession(id: string): Promise<AdminSessionRow> {
    return this.updateSessionStatus(id, ClassSessionStatus.CANCELLED);
  }

  async deleteSession(id: string): Promise<void> {
    await this.prisma.classSession.delete({ where: { id } });
    await this.invalidatePublicScheduleAndEmit(id);
  }

  private async invalidatePublicScheduleAndEmit(
    sessionId: string,
  ): Promise<void> {
    await this.schedule.invalidatePublicCache();
    this.realtime.emitPublicScheduleSession(sessionId);
  }

  private async assertCoachAssignedToClassType(
    coachId: string,
    classTypeId: string,
  ): Promise<void> {
    const coach = await this.prisma.coachProfile.findUnique({
      where: { id: coachId },
      select: { assignedClassTypeIds: true, isActive: true },
    });
    if (!coach?.isActive) {
      throw new BadRequestException('Coach is not available');
    }
    if (!coach.assignedClassTypeIds.includes(classTypeId)) {
      throw new BadRequestException('Coach is not assigned to this class type');
    }
  }

  private async findSessionAdminOrThrow(id: string): Promise<AdminSessionRow> {
    const session = await this.prisma.classSession.findUnique({
      where: { id },
      include: ADMIN_SESSION_INCLUDE,
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return mapAdminSessionRows([session])[0];
  }
}
