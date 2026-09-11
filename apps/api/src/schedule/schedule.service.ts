import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ClassSessionStatus,
  ScheduleDayOfWeek,
  type ScheduleItem,
} from '@prisma/client';
import {
  PUBLIC_CACHE_KEYS,
  PUBLIC_CACHE_TTL_SEC,
} from '../cache/public-cache-keys';
import { BookingCancelIntentService } from '../cache/booking-cancel-intent.service';
import { RedisCacheService } from '../cache/redis-cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleItemDto } from './dto/create-schedule-item.dto';
import { UpdateScheduleItemDto } from './dto/update-schedule-item.dto';
import {
  mapSessionsToPublicScheduleItems,
  PUBLIC_SCHEDULE_SESSION_INCLUDE,
  type PublicScheduleItem,
} from './map-sessions-to-public-schedule-items';
import {
  resolvePublicScheduleRange,
  publicScheduleCacheDayKey,
} from './public-schedule-range';

const DAY_ORDER: Record<ScheduleDayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

function normalizeOptional(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

function assertTimeRange(startTime: string, endTime?: string): void {
  if (endTime === undefined) {
    return;
  }
  if (endTime <= startTime) {
    throw new BadRequestException('endTime must be later than startTime');
  }
}

@Injectable()
export class ScheduleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisCacheService,
    private readonly cancelIntent: BookingCancelIntentService,
  ) {}

  private sortByDayAndTime(items: ScheduleItem[]): ScheduleItem[] {
    return [...items].sort((a, b) => {
      const dayDelta = DAY_ORDER[a.dayOfWeek] - DAY_ORDER[b.dayOfWeek];
      if (dayDelta !== 0) {
        return dayDelta;
      }
      if (a.startTime !== b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  private sortPublicByDateAndTime(
    items: PublicScheduleItem[],
  ): PublicScheduleItem[] {
    return [...items].sort((a, b) => {
      if (a.sessionDate !== b.sessionDate) {
        return a.sessionDate.localeCompare(b.sessionDate);
      }
      if (a.startTime !== b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  async listAdmin() {
    const items = await this.prisma.scheduleItem.findMany({
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    return this.sortByDayAndTime(items);
  }

  async listPublicActive(params?: { from?: string; to?: string }) {
    const range = resolvePublicScheduleRange(params?.from, params?.to);
    const dayKey = publicScheduleCacheDayKey(range.from);
    const items = await this.cache.getOrSet(
      `${PUBLIC_CACHE_KEYS.schedule}:${dayKey}`,
      PUBLIC_CACHE_TTL_SEC.schedule,
      () => this.loadPublicActiveFromDb(range),
    );
    return this.cancelIntent.applyToPublicItems(items);
  }

  /** Clears cached public schedule after class session mutations. */
  async invalidatePublicCache(): Promise<void> {
    await this.cache.invalidateByPrefix(PUBLIC_CACHE_KEYS.schedule);
  }

  private async loadPublicActiveFromDb(range: { from: Date; to: Date }) {
    const sessions = await this.prisma.classSession.findMany({
      where: {
        status: {
          in: [
            ClassSessionStatus.ACTIVE,
            ClassSessionStatus.FULL,
            ClassSessionStatus.FINISHED,
          ],
        },
        startsAt: { gte: range.from, lte: range.to },
      },
      include: PUBLIC_SCHEDULE_SESSION_INCLUDE,
      orderBy: [{ startsAt: 'asc' }, { createdAt: 'desc' }],
    });
    const items = mapSessionsToPublicScheduleItems(sessions);
    return this.sortPublicByDateAndTime(items);
  }

  async create(dto: CreateScheduleItemDto) {
    assertTimeRange(dto.startTime, dto.endTime);
    const item = await this.prisma.scheduleItem.create({
      data: {
        className: dto.className.trim(),
        instructorName: dto.instructorName.trim(),
        classType: dto.classType.trim(),
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: normalizeOptional(dto.endTime),
        durationMinutes: dto.durationMinutes,
        availableSpots: dto.availableSpots,
        description: normalizeOptional(dto.description),
        isActive: dto.isActive ?? true,
      },
    });
    await this.cache.invalidateByPrefix(PUBLIC_CACHE_KEYS.schedule);
    return item;
  }

  async update(id: string, dto: UpdateScheduleItemDto) {
    const existing = await this.prisma.scheduleItem.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Schedule item not found');
    }

    const nextStart = dto.startTime ?? existing.startTime;
    const nextEnd = dto.endTime ?? existing.endTime ?? undefined;
    assertTimeRange(nextStart, nextEnd);

    const item = await this.prisma.scheduleItem.update({
      where: { id },
      data: {
        className: dto.className?.trim(),
        instructorName: dto.instructorName?.trim(),
        classType: dto.classType?.trim(),
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime:
          dto.endTime === undefined
            ? undefined
            : normalizeOptional(dto.endTime),
        durationMinutes: dto.durationMinutes,
        availableSpots: dto.availableSpots,
        description:
          dto.description === undefined
            ? undefined
            : normalizeOptional(dto.description),
        isActive: dto.isActive,
      },
    });
    await this.cache.invalidateByPrefix(PUBLIC_CACHE_KEYS.schedule);
    return item;
  }

  async remove(id: string): Promise<void> {
    await this.prisma.scheduleItem.delete({ where: { id } });
    await this.cache.invalidateByPrefix(PUBLIC_CACHE_KEYS.schedule);
  }
}
