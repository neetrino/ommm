import { Injectable } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  COACH_PANEL_SESSIONS_LIST_LIMIT,
  mapCoachPanelSessionRow,
  resolveCoachPanelScheduleRange,
  type CoachPanelSessionRow,
} from './coaches-panel-sessions.helpers';

const COACH_PANEL_SESSION_INCLUDE =
  Prisma.validator<Prisma.ClassSessionInclude>()({
    classType: { select: { id: true, name: true } },
    coach: {
      select: {
        id: true,
        user: { select: { name: true, lastName: true } },
      },
    },
    _count: {
      select: {
        bookings: {
          where: {
            status: {
              in: [
                BookingStatus.BOOKED,
                BookingStatus.COMPLETED,
                BookingStatus.MISSED,
              ],
            },
          },
        },
      },
    },
  });

@Injectable()
export class CoachesPanelSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string): Promise<CoachPanelSessionRow[] | null> {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      return null;
    }

    const { from, to } = resolveCoachPanelScheduleRange();
    const sessions = await this.prisma.classSession.findMany({
      where: {
        coachId: profile.id,
        startsAt: { gte: from, lte: to },
      },
      include: COACH_PANEL_SESSION_INCLUDE,
      orderBy: { startsAt: 'asc' },
      take: COACH_PANEL_SESSIONS_LIST_LIMIT,
    });
    return sessions.map((session) => mapCoachPanelSessionRow(session));
  }
}
