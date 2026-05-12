import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BookingStatus,
  ClassSessionStatus,
  type ClassSession,
  type ClassType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateClassTypeDto } from './dto/create-class-type.dto';
import type { CreateSessionDto } from './dto/create-session.dto';

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

  async createSession(dto: CreateSessionDto): Promise<ClassSession> {
    return this.prisma.classSession.create({
      data: {
        classTypeId: dto.classTypeId,
        coachId: dto.coachId,
        substituteCoachId: dto.substituteCoachId,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        capacity: dto.capacity,
        level: dto.level,
        priceCents: dto.priceCents,
        status: ClassSessionStatus.ACTIVE,
      },
    });
  }

  async updateSessionStatus(id: string, status: ClassSessionStatus) {
    const s = await this.prisma.classSession.findUnique({ where: { id } });
    if (!s) throw new NotFoundException();
    return this.prisma.classSession.update({
      where: { id },
      data: { status },
    });
  }

  async deleteSession(id: string): Promise<void> {
    await this.prisma.classSession.delete({ where: { id } });
  }
}
