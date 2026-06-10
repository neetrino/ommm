import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingStatus,
  ClassSessionStatus,
  type ClassSession,
  type ClassType,
  type Prisma,
  type ScheduleDayOfWeek,
} from '@prisma/client';
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
  buildSessionsListWhere,
  filterSessionRows,
  paginateSessionRows,
  requiresSessionsPostProcessing,
  SESSIONS_FILTER_SCAN_LIMIT,
} from './classes-sessions-list-filters';
import type { AdminListSessionsQueryDto } from './dto/admin-list-sessions-query.dto';
import type { CreateClassTypeDto } from './dto/create-class-type.dto';
import type {
  CreateSessionBatchDto,
  CreateSessionBatchSlotDto,
} from './dto/create-session-batch.dto';
import type { CreateSessionDto } from './dto/create-session.dto';
import type { UpdateClassTypeDto } from './dto/update-class-type.dto';
import type { UpdateSessionDto } from './dto/update-session.dto';

type SessionRecurrencePayload = {
  recurrencePattern: SessionRecurrencePatternValue;
  recurrenceWeekdays: ScheduleDayOfWeek[];
  recurrenceEndsAt: Date | null;
  recurrenceCount: number | null;
};

const SESSION_RECURRENCE_PATTERN = {
  NONE: 'NONE',
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  CUSTOM_WEEKDAYS: 'CUSTOM_WEEKDAYS',
} as const;

const SCHEDULE_DAY_INDEX: Record<ScheduleDayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

const MAX_BATCH_SESSIONS = 200;

type SessionRecurrencePatternValue =
  (typeof SESSION_RECURRENCE_PATTERN)[keyof typeof SESSION_RECURRENCE_PATTERN];

type ClassSessionWithRecurrence = ClassSession & {
  recurrencePattern: SessionRecurrencePatternValue;
  recurrenceWeekdays: ScheduleDayOfWeek[];
  recurrenceEndsAt: Date | null;
  recurrenceCount: number | null;
};

const ADMIN_SESSION_INCLUDE = {
  classType: true,
  coach: {
    include: {
      user: { select: { name: true } },
    },
  },
  _count: {
    select: {
      bookings: { where: { status: BookingStatus.BOOKED } },
    },
  },
} as const;

type AdminSessionRow = Prisma.ClassSessionGetPayload<{
  include: typeof ADMIN_SESSION_INCLUDE;
}>;

@Injectable()
export class ClassesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly schedule: ScheduleService,
    private readonly realtime: RealtimePublisherService,
  ) {}

  private async invalidatePublicScheduleAndEmit(sessionId: string): Promise<void> {
    await this.schedule.invalidatePublicCache();
    this.realtime.emitPublicScheduleSession(sessionId);
  }

  listTypes() {
    return this.prisma.classType.findMany({ orderBy: { name: 'asc' } });
  }

  async createType(dto: CreateClassTypeDto): Promise<ClassType> {
    const name = dto.name.trim();
    const slug = dto.slug.trim().toLowerCase();
    await this.assertClassTypeUnique({ name, slug });
    return this.prisma.classType.create({
      data: {
        name,
        slug,
        description: this.normalizeOptional(dto.description),
      },
    });
  }

  async updateType(id: string, dto: UpdateClassTypeDto): Promise<ClassType> {
    const current = await this.findTypeOrThrow(id);
    const name = dto.name !== undefined ? dto.name.trim() : current.name;
    const slug =
      dto.slug !== undefined
        ? dto.slug.trim().toLowerCase()
        : dto.name !== undefined
          ? this.buildSlugFromName(name)
          : current.slug;
    if (name.length === 0 || slug.length === 0) {
      throw new BadRequestException('Class type name and slug are required.');
    }
    await this.assertClassTypeUnique({ name, slug, excludeId: id });
    return this.prisma.classType.update({
      where: { id },
      data: {
        name,
        slug,
        ...(dto.description !== undefined && {
          description: this.normalizeOptional(dto.description),
        }),
      },
    });
  }

  async deleteType(id: string): Promise<void> {
    await this.findTypeOrThrow(id);
    const sessionCount = await this.prisma.classSession.count({
      where: { classTypeId: id },
    });
    if (sessionCount > 0) {
      throw new BadRequestException(
        `Cannot delete class type with ${sessionCount} linked class sessions.`,
      );
    }
    await this.prisma.classType.delete({ where: { id } });
  }

  private async findTypeOrThrow(id: string): Promise<ClassType> {
    const row = await this.prisma.classType.findUnique({ where: { id } });
    if (row === null) {
      throw new NotFoundException('Class type not found.');
    }
    return row;
  }

  private async assertClassTypeUnique(params: {
    name: string;
    slug: string;
    excludeId?: string;
  }): Promise<void> {
    const conflict = await this.prisma.classType.findFirst({
      where: {
        id:
          params.excludeId !== undefined
            ? { not: params.excludeId }
            : undefined,
        OR: [
          { slug: params.slug },
          { name: { equals: params.name, mode: 'insensitive' } },
        ],
      },
    });
    if (conflict !== null) {
      throw new BadRequestException(
        'A class type with this name or slug already exists.',
      );
    }
  }

  private buildSlugFromName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .split('-')
      .filter((segment) => segment.length > 0)
      .join('-')
      .slice(0, 120);
  }

  listSessionsPublic(params: {
    from: Date;
    to?: Date;
    coachId?: string;
    typeId?: string;
  }) {
    return this.prisma.classSession.findMany({
      where: {
        status: { in: [ClassSessionStatus.ACTIVE, ClassSessionStatus.FULL] },
        startsAt: {
          gte: params.from,
          ...(params.to !== undefined ? { lte: params.to } : {}),
        },
        ...(params.coachId && { coachId: params.coachId }),
        ...(params.typeId && { classTypeId: params.typeId }),
      },
      include: {
        classType: true,
        coach: {
          include: { user: { select: { name: true, avatarUrl: true } } },
        },
        _count: {
          select: {
            bookings: { where: { status: BookingStatus.BOOKED } },
          },
        },
      },
      orderBy: { startsAt: 'asc' },
    });
  }

  getSessionPublic(id: string) {
    return this.prisma.classSession.findFirst({
      where: { id },
      include: {
        classType: true,
        coach: {
          include: {
            user: { select: { name: true, avatarUrl: true, id: true } },
          },
        },
        substituteCoach: {
          include: { user: { select: { name: true, avatarUrl: true } } },
        },
        _count: {
          select: {
            bookings: { where: { status: BookingStatus.BOOKED } },
          },
        },
      },
    });
  }

  async listSessionsAdmin(query: AdminListSessionsQueryDto): Promise<
    | AdminSessionRow[]
    | {
        items: AdminSessionRow[];
        total: number;
        take: number;
        offset: number;
      }
  > {
    const normalizedQuery = this.normalizeSessionsListQuery(query);
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
    const mapSessions = (
      sessions: Array<
        AdminSessionRow & {
          status: ClassSessionStatus;
          _count: { bookings: number };
          capacity: number;
        }
      >,
    ): AdminSessionRow[] =>
      sessions.map((session) => ({
        ...session,
        status:
          session.status === ClassSessionStatus.ACTIVE &&
          session._count.bookings >= session.capacity
            ? ClassSessionStatus.FULL
            : session.status,
      }));

    if (!hasPagination) {
      const sessions = await this.prisma.classSession.findMany(findArgs);
      return mapSessions(sessions);
    }

    const take = normalizedQuery.take ?? DEFAULT_LIST_PAGE_SIZE;
    const offset = normalizedQuery.offset ?? 0;

    if (requiresSessionsPostProcessing(normalizedQuery)) {
      const sessions = await this.prisma.classSession.findMany({
        ...findArgs,
        take: SESSIONS_FILTER_SCAN_LIMIT,
      });
      const mapped = mapSessions(sessions);
      const filtered = filterSessionRows(mapped, normalizedQuery);
      const sorted = sortAdminSessionRows(
        filtered,
        normalizedQuery.order ?? SessionListOrder.UPCOMING,
      );
      return paginateSessionRows(sorted, take, offset);
    }

    const [sessions, total] = await Promise.all([
      this.prisma.classSession.findMany({ ...findArgs, take, skip: offset }),
      this.prisma.classSession.count({ where }),
    ]);
    return {
      items: mapSessions(sessions),
      total,
      take,
      offset,
    };
  }

  private normalizeSessionsListQuery(
    query: AdminListSessionsQueryDto,
  ): AdminListSessionsQueryDto {
    const coachIds = [
      ...(query.coachIds
        ?.split(',')
        .map((item) => item.trim())
        .filter(Boolean) ?? []),
      ...(query.coachId ? [query.coachId] : []),
    ];
    const classTypeIds = [
      ...(query.classTypeIds
        ?.split(',')
        .map((item) => item.trim())
        .filter(Boolean) ?? []),
      ...(query.typeId ? [query.typeId] : []),
    ];
    const statuses = [
      ...(query.statuses
        ?.split(',')
        .map((item) => item.trim())
        .filter(Boolean) ?? []),
      ...(query.status ? [query.status] : []),
    ];
    const levels = [
      ...(query.levels
        ?.split(',')
        .map((item) => item.trim())
        .filter(Boolean) ?? []),
      ...(query.level ? [query.level] : []),
    ];

    return {
      ...query,
      coachIds:
        coachIds.length > 0 ? [...new Set(coachIds)].join(',') : query.coachIds,
      classTypeIds:
        classTypeIds.length > 0
          ? [...new Set(classTypeIds)].join(',')
          : query.classTypeIds,
      statuses:
        statuses.length > 0 ? [...new Set(statuses)].join(',') : query.statuses,
      levels: levels.length > 0 ? [...new Set(levels)].join(',') : query.levels,
    };
  }

  private normalizeOptional(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : null;
  }

  private async resolveSessionTitle(
    title: string | undefined,
    classTypeId: string,
  ): Promise<string> {
    const trimmedTitle = title?.trim() ?? '';
    if (trimmedTitle.length > 0) {
      return trimmedTitle;
    }

    const classType = await this.prisma.classType.findUnique({
      where: { id: classTypeId },
      select: { name: true },
    });
    const classTypeName = classType?.name?.trim() ?? '';
    if (classTypeName.length === 0) {
      throw new BadRequestException('Class type is required.');
    }
    return classTypeName;
  }

  private assertTimeRange(startsAt: Date, endsAt: Date): void {
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      throw new BadRequestException('Invalid class date range');
    }
    if (endsAt <= startsAt) {
      throw new BadRequestException('Class end time must be after start time');
    }
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

  private assertTimeValue(value: string): void {
    const [hourRaw, minuteRaw] = value.split(':');
    const hour = Number(hourRaw);
    const minute = Number(minuteRaw);
    if (
      !Number.isInteger(hour) ||
      !Number.isInteger(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      throw new BadRequestException('Invalid weekly slot time');
    }
  }

  private parseLocalDate(value: string): Date {
    const [yearRaw, monthRaw, dayRaw] = value.slice(0, 10).split('-');
    const year = Number(yearRaw);
    const month = Number(monthRaw);
    const day = Number(dayRaw);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day) ||
      Number.isNaN(parsed.getTime())
    ) {
      throw new BadRequestException('Invalid calendar schedule date');
    }
    return parsed;
  }

  private localDateTimeToUtc(
    date: Date,
    time: string,
    timezoneOffsetMinutes: number,
  ): Date {
    this.assertTimeValue(time);
    const [hourRaw, minuteRaw] = time.split(':');
    const utcMs =
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        Number(hourRaw),
        Number(minuteRaw),
      ) +
      timezoneOffsetMinutes * 60_000;
    return new Date(utcMs);
  }

  private buildBatchSessionData(
    dto: CreateSessionBatchDto,
    title: string,
  ): Prisma.ClassSessionUncheckedCreateInput[] {
    const startDate = this.parseLocalDate(dto.startDate);
    const endDate = this.parseLocalDate(dto.endDate);
    if (endDate < startDate) {
      throw new BadRequestException(
        'Calendar schedule end date must be after start date',
      );
    }

    const rows: Prisma.ClassSessionUncheckedCreateInput[] = [];
    for (
      const cursor = new Date(startDate);
      cursor <= endDate;
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    ) {
      for (const slot of dto.slots) {
        if (cursor.getUTCDay() !== SCHEDULE_DAY_INDEX[slot.weekday]) {
          continue;
        }
        rows.push(this.buildBatchSessionSlotData(dto, slot, cursor, title));
      }
    }

    if (rows.length === 0) {
      throw new BadRequestException(
        'Calendar schedule did not generate any classes',
      );
    }
    if (rows.length > MAX_BATCH_SESSIONS) {
      throw new BadRequestException(
        `Calendar schedule can generate at most ${MAX_BATCH_SESSIONS} classes`,
      );
    }
    return rows;
  }

  private buildBatchSessionSlotData(
    dto: CreateSessionBatchDto,
    slot: CreateSessionBatchSlotDto,
    date: Date,
    title: string,
  ): Prisma.ClassSessionUncheckedCreateInput {
    const startsAt = this.localDateTimeToUtc(
      date,
      slot.startTime,
      dto.timezoneOffsetMinutes,
    );
    const endsAt = this.localDateTimeToUtc(
      date,
      slot.endTime,
      dto.timezoneOffsetMinutes,
    );
    this.assertTimeRange(startsAt, endsAt);
    return {
      title,
      description: this.normalizeOptional(dto.description),
      classTypeId: dto.classTypeId,
      coachId: dto.coachId,
      startsAt,
      endsAt,
      capacity: dto.capacity,
      level: this.normalizeOptional(dto.level),
      priceCents: 0,
      status: dto.status ?? ClassSessionStatus.ACTIVE,
      recurrencePattern: SESSION_RECURRENCE_PATTERN.NONE,
      recurrenceWeekdays: [],
      recurrenceEndsAt: null,
      recurrenceCount: null,
    };
  }

  private buildRecurrencePayloadForCreate(
    dto: CreateSessionDto,
  ): SessionRecurrencePayload {
    const pattern = dto.recurrencePattern ?? SESSION_RECURRENCE_PATTERN.NONE;
    const weekdays = dto.recurrenceWeekdays ?? [];
    if (
      pattern === SESSION_RECURRENCE_PATTERN.CUSTOM_WEEKDAYS &&
      weekdays.length === 0
    ) {
      throw new BadRequestException(
        'Choose at least one weekday for custom recurrence',
      );
    }
    if (pattern === SESSION_RECURRENCE_PATTERN.NONE) {
      return {
        recurrencePattern: SESSION_RECURRENCE_PATTERN.NONE,
        recurrenceWeekdays: [],
        recurrenceEndsAt: null,
        recurrenceCount: null,
      };
    }
    return {
      recurrencePattern: pattern,
      recurrenceWeekdays:
        pattern === SESSION_RECURRENCE_PATTERN.CUSTOM_WEEKDAYS ? weekdays : [],
      recurrenceEndsAt: dto.recurrenceEndsAt
        ? new Date(dto.recurrenceEndsAt)
        : null,
      recurrenceCount: dto.recurrenceCount ?? null,
    };
  }

  private buildRecurrencePayloadForUpdate(
    dto: UpdateSessionDto,
    current: ClassSessionWithRecurrence,
  ): SessionRecurrencePayload {
    const pattern = dto.recurrencePattern ?? current.recurrencePattern;
    const weekdays = dto.recurrenceWeekdays ?? current.recurrenceWeekdays;
    if (
      pattern === SESSION_RECURRENCE_PATTERN.CUSTOM_WEEKDAYS &&
      weekdays.length === 0
    ) {
      throw new BadRequestException(
        'Choose at least one weekday for custom recurrence',
      );
    }
    if (pattern === SESSION_RECURRENCE_PATTERN.NONE) {
      return {
        recurrencePattern: SESSION_RECURRENCE_PATTERN.NONE,
        recurrenceWeekdays: [],
        recurrenceEndsAt: null,
        recurrenceCount: null,
      };
    }
    return {
      recurrencePattern: pattern,
      recurrenceWeekdays:
        pattern === SESSION_RECURRENCE_PATTERN.CUSTOM_WEEKDAYS ? weekdays : [],
      recurrenceEndsAt:
        dto.recurrenceEndsAt === undefined
          ? current.recurrenceEndsAt
          : dto.recurrenceEndsAt
            ? new Date(dto.recurrenceEndsAt)
            : null,
      recurrenceCount:
        dto.recurrenceCount === undefined
          ? current.recurrenceCount
          : dto.recurrenceCount,
    };
  }

  async createSession(dto: CreateSessionDto): Promise<AdminSessionRow> {
    await this.assertCoachAssignedToClassType(dto.coachId, dto.classTypeId);
    if (dto.substituteCoachId) {
      await this.assertCoachAssignedToClassType(
        dto.substituteCoachId,
        dto.classTypeId,
      );
    }
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);
    this.assertTimeRange(startsAt, endsAt);
    const recurrence = this.buildRecurrencePayloadForCreate(dto);
    const title = await this.resolveSessionTitle(dto.title, dto.classTypeId);

    const createData = {
      title,
      description: this.normalizeOptional(dto.description),
      classTypeId: dto.classTypeId,
      coachId: dto.coachId,
      substituteCoachId: dto.substituteCoachId,
      startsAt,
      endsAt,
      capacity: dto.capacity,
      level: this.normalizeOptional(dto.level),
      classFormat: this.normalizeOptional(dto.classFormat),
      priceCents: dto.priceCents ?? 0,
      sessionRequirement: dto.sessionRequirement ?? null,
      status: dto.status ?? ClassSessionStatus.ACTIVE,
      recurrencePattern: recurrence.recurrencePattern,
      recurrenceWeekdays: recurrence.recurrenceWeekdays,
      recurrenceEndsAt: recurrence.recurrenceEndsAt,
      recurrenceCount: recurrence.recurrenceCount,
    } as Prisma.ClassSessionUncheckedCreateInput;

    const created = await this.prisma.classSession.create({
      data: createData,
    });
    await this.invalidatePublicScheduleAndEmit(created.id);
    return this.findSessionAdminOrThrow(created.id);
  }

  async createSessionBatch(
    dto: CreateSessionBatchDto,
  ): Promise<AdminSessionRow[]> {
    await this.assertCoachAssignedToClassType(dto.coachId, dto.classTypeId);
    const title = await this.resolveSessionTitle(dto.title, dto.classTypeId);
    const createRows = this.buildBatchSessionData(dto, title);
    const created = await this.prisma.$transaction(
      createRows.map((data) => this.prisma.classSession.create({ data })),
    );
    await Promise.all(
      created.map((session) => this.invalidatePublicScheduleAndEmit(session.id)),
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
    await this.assertCoachAssignedToClassType(nextCoachId, nextClassTypeId);
    if (dto.substituteCoachId) {
      await this.assertCoachAssignedToClassType(
        dto.substituteCoachId,
        nextClassTypeId,
      );
    }

    const startsAt = dto.startsAt ? new Date(dto.startsAt) : existing.startsAt;
    const endsAt = dto.endsAt ? new Date(dto.endsAt) : existing.endsAt;
    this.assertTimeRange(startsAt, endsAt);
    const recurrence = this.buildRecurrencePayloadForUpdate(dto, existing);

    const updateData = {
      ...(dto.title !== undefined && { title: dto.title.trim() }),
      ...(dto.description !== undefined && {
        description: this.normalizeOptional(dto.description),
      }),
      ...(dto.classTypeId !== undefined && { classTypeId: dto.classTypeId }),
      ...(dto.coachId !== undefined && { coachId: dto.coachId }),
      ...(dto.substituteCoachId !== undefined && {
        substituteCoachId: this.normalizeOptional(dto.substituteCoachId),
      }),
      ...(dto.startsAt !== undefined && { startsAt }),
      ...(dto.endsAt !== undefined && { endsAt }),
      ...(dto.capacity !== undefined && { capacity: dto.capacity }),
      ...(dto.level !== undefined && {
        level: this.normalizeOptional(dto.level),
      }),
      ...(dto.classFormat !== undefined && {
        classFormat: this.normalizeOptional(dto.classFormat),
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
    } as Prisma.ClassSessionUncheckedUpdateInput;

    await this.prisma.classSession.update({
      where: { id },
      data: updateData,
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

  private async findSessionAdminOrThrow(id: string): Promise<AdminSessionRow> {
    const session = await this.prisma.classSession.findUnique({
      where: { id },
      include: ADMIN_SESSION_INCLUDE,
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return {
      ...session,
      status:
        session.status === ClassSessionStatus.ACTIVE &&
        session._count.bookings >= session.capacity
          ? ClassSessionStatus.FULL
          : session.status,
    };
  }
}
