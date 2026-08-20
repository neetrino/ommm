import { Injectable } from '@nestjs/common';
import { Prisma, Role, type User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BookingsStatusTransitionService } from './bookings-status-transition.service';

@Injectable()
export class BookingsAdminListService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly statusTransition: BookingsStatusTransitionService,
  ) {}

  async listAdmin(filters: {
    actor: User;
    sessionId?: string;
    userId?: string;
    from?: Date;
    to?: Date;
  }) {
    await this.statusTransition.completePastBookedSessions();

    const coachScope =
      filters.actor.role === Role.COACH
        ? ({
            coach: { userId: filters.actor.id },
          } as Prisma.ClassSessionWhereInput)
        : undefined;
    const sessionFilter: Prisma.ClassSessionWhereInput | undefined =
      filters.from && filters.to
        ? {
            startsAt: { gte: filters.from, lte: filters.to },
            ...(coachScope ?? {}),
          }
        : coachScope;
    return this.prisma.booking.findMany({
      where: {
        ...(filters.sessionId && { sessionId: filters.sessionId }),
        ...(filters.userId && { userId: filters.userId }),
        ...(sessionFilter && { session: sessionFilter }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        session: {
          include: {
            classType: true,
            coach: { include: { user: { select: { id: true, name: true } } } },
          },
        },
        notes: { include: { author: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }
}
