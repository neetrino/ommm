import { Injectable } from '@nestjs/common';
import { BookingStatus, ClassSessionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClassesSessionsPublicService {
  constructor(private readonly prisma: PrismaService) {}

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
}
