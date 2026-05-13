import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ScheduleDayOfWeek, type ScheduleItem } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleItemDto } from './dto/create-schedule-item.dto';
import { UpdateScheduleItemDto } from './dto/update-schedule-item.dto';

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
  constructor(private readonly prisma: PrismaService) {}

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

  async listPublicActive() {
    const items = await this.prisma.scheduleItem.findMany({
      where: { isActive: true },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    return this.sortByDayAndTime(items);
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
    return item;
  }

  async remove(id: string): Promise<void> {
    await this.prisma.scheduleItem.delete({ where: { id } });
  }
}
