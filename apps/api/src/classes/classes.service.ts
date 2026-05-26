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
import { PrismaService } from '../prisma/prisma.service';
import type { AdminListSessionsQueryDto } from './dto/admin-list-sessions-query.dto';
import type { CreateClassTypeDto } from './dto/create-class-type.dto';
import type { CreateSessionDto } from './dto/create-session.dto';
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
  constructor(private readonly prisma: PrismaService) {}

  listTypes() {
    return this.prisma.classType.findMany({ orderBy: { name: 'asc' } });
  }

  createType(dto: CreateClassTypeDto): Promise<ClassType> {
    return this.prisma.classType.create({
      data: {
        name: dto.name,
        slug: dto.slug.toLowerCase(),
        description: dto.description,
      },
    });
  }

  async deleteType(id: string): Promise<void> {
    await this.prisma.classType.delete({ where: { id } });
  }

  listSessionsPublic(params: {
    from: Date;
    to: Date;
    coachId?: string;
    typeId?: string;
  }) {
    return this.prisma.classSession.findMany({
      where: {
        status: { in: [ClassSessionStatus.ACTIVE, ClassSessionStatus.FULL] },
        startsAt: { gte: params.from, lte: params.to },
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

  async listSessionsAdmin(
    query: AdminListSessionsQueryDto,
  ): Promise<AdminSessionRow[]> {
    const where: Prisma.ClassSessionWhereInput = {
      ...(query.from || query.to
        ? {
            startsAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.coachId ? { coachId: query.coachId } : {}),
      ...(query.typeId ? { classTypeId: query.typeId } : {}),
      ...(query.level ? { level: query.level } : {}),
      ...(query.classFormat ? { classFormat: query.classFormat } : {}),
    };

    const sessions = await this.prisma.classSession.findMany({
      where,
      include: ADMIN_SESSION_INCLUDE,
      orderBy: { startsAt: 'asc' },
    });

    return sessions.map((session) => ({
      ...session,
      status:
        session.status === ClassSessionStatus.ACTIVE &&
        session._count.bookings >= session.capacity
          ? ClassSessionStatus.FULL
          : session.status,
    }));
  }

  private normalizeOptional(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : null;
  }

  private assertTimeRange(startsAt: Date, endsAt: Date): void {
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
      throw new BadRequestException('Invalid class date range');
    }
    if (endsAt <= startsAt) {
      throw new BadRequestException('Class end time must be after start time');
    }
  }

  private buildRecurrencePayloadForCreate(
    dto: CreateSessionDto,
  ): SessionRecurrencePayload {
    const pattern =
      (dto.recurrencePattern ?? SESSION_RECURRENCE_PATTERN.NONE) as SessionRecurrencePatternValue;
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
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);
    this.assertTimeRange(startsAt, endsAt);
    const recurrence = this.buildRecurrencePayloadForCreate(dto);

    const createData = {
        title: dto.title.trim(),
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
        status: dto.status ?? ClassSessionStatus.DRAFT,
        recurrencePattern: recurrence.recurrencePattern,
        recurrenceWeekdays: recurrence.recurrenceWeekdays,
        recurrenceEndsAt: recurrence.recurrenceEndsAt,
        recurrenceCount: recurrence.recurrenceCount,
      } as Prisma.ClassSessionUncheckedCreateInput;

    const created = await this.prisma.classSession.create({
      data: createData,
    });
    return this.findSessionAdminOrThrow(created.id);
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
    return this.findSessionAdminOrThrow(id);
  }

  async updateSessionStatus(id: string, status: ClassSessionStatus) {
    const s = await this.prisma.classSession.findUnique({ where: { id } });
    if (!s) throw new NotFoundException();
    await this.prisma.classSession.update({
      where: { id },
      data: { status },
    });
    return this.findSessionAdminOrThrow(id);
  }

  async cancelSession(id: string): Promise<AdminSessionRow> {
    return this.updateSessionStatus(id, ClassSessionStatus.CANCELLED);
  }

  async deleteSession(id: string): Promise<void> {
    await this.prisma.classSession.delete({ where: { id } });
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
