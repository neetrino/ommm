import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingStatus,
  ClassSessionStatus,
  Role,
  UserPackageStatus,
} from '@prisma/client';
import { BookingsService } from '../bookings/bookings.service';
import { ADMIN_SESSION_INCLUDE } from '../classes/classes-session.helpers';
import {
  hasAnyBookableCredit,
  isUserPackageBookableAt,
  membershipCoversSessionType,
  type UserPackageWithPlanAndBalances,
} from '../packages/package-usage.helpers';
import { PrismaService } from '../prisma/prisma.service';
import type { AdminCreateClientBookingDto } from './dto/admin-create-client-booking.dto';

const USER_PACKAGE_BALANCE_SELECT = {
  id: true,
  classTypeId: true,
  sourceCategoryNameSnapshot: true,
  sessionsTotal: true,
  sessionsUsed: true,
  sessionsRemaining: true,
  isUnlimited: true,
} as const;

const USER_PACKAGE_PLAN_SELECT = {
  id: true,
  name: true,
  categoryName: true,
  isUnlimited: true,
} as const;

const BOOKABLE_SESSIONS_LOOKAHEAD_DAYS = 30;

@Injectable()
export class ClientsBookingsCreateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookings: BookingsService,
  ) {}

  async createForClient(clientId: string, dto: AdminCreateClientBookingDto) {
    await this.assertClientExists(clientId);
    return this.bookings.book(clientId, dto.sessionId, {
      userPackageId: dto.userPackageId,
    });
  }

  async listEligiblePackages(clientId: string, sessionId: string) {
    await this.assertClientExists(clientId);
    return this.bookings.listEligiblePackagesForSession(clientId, sessionId);
  }

  /**
   * Upcoming sessions this client can be assigned to via an active package
   * (matching class type + remaining credits + validity window).
   * Excludes full / already-booked / cancelled / draft / past.
   */
  async listBookableSessions(
    clientId: string,
    fromRaw?: string,
    toRaw?: string,
  ) {
    await this.assertClientExists(clientId);
    const now = new Date();
    const from = fromRaw !== undefined ? new Date(fromRaw) : now;
    const to =
      toRaw !== undefined
        ? new Date(toRaw)
        : new Date(
            now.getTime() +
              BOOKABLE_SESSIONS_LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000,
          );
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new BadRequestException('Invalid date range');
    }
    if (to.getTime() < from.getTime()) {
      throw new BadRequestException('Invalid date range');
    }

    const [sessions, memberships] = await Promise.all([
      this.prisma.classSession.findMany({
        where: {
          startsAt: { gte: from, lte: to },
          status: {
            notIn: [
              ClassSessionStatus.CANCELLED,
              ClassSessionStatus.DRAFT,
              ClassSessionStatus.FINISHED,
            ],
          },
        },
        include: ADMIN_SESSION_INCLUDE,
        orderBy: { startsAt: 'asc' },
      }),
      this.prisma.userPackage.findMany({
        where: {
          userId: clientId,
          status: UserPackageStatus.ACTIVE,
          OR: [
            { awaitingFirstVisit: true },
            {
              currentPeriodEnd: { gt: from },
              currentPeriodStart: { lte: to },
            },
          ],
        },
        include: {
          plan: { select: USER_PACKAGE_PLAN_SELECT },
          balances: { select: USER_PACKAGE_BALANCE_SELECT },
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const sessionIds = sessions.map((session) => session.id);
    const existingBookings =
      sessionIds.length === 0
        ? []
        : await this.prisma.booking.findMany({
            where: {
              userId: clientId,
              sessionId: { in: sessionIds },
              status: BookingStatus.BOOKED,
            },
            select: { sessionId: true },
          });
    const bookedSessionIds = new Set(
      existingBookings.map((booking) => booking.sessionId),
    );

    const typedMemberships =
      memberships as unknown as UserPackageWithPlanAndBalances[];

    return sessions
      .filter((session) => {
        if (session.startsAt.getTime() <= now.getTime()) {
          return false;
        }
        if (bookedSessionIds.has(session.id)) {
          return false;
        }
        if (session._count.bookings >= session.capacity) {
          return false;
        }
        return this.clientCanBeAssignedToSession(session, typedMemberships);
      })
      .map((session) => ({
        id: session.id,
        startsAt: session.startsAt.toISOString(),
        status: session.status,
        priceCents: session.priceCents,
        sessionRequirement: session.sessionRequirement,
        classType: { name: session.classType.name },
        coach: { user: { name: session.coach.user.name } },
      }));
  }

  private clientCanBeAssignedToSession(
    session: {
      startsAt: Date;
      classType: { id: string; name: string };
    },
    memberships: readonly UserPackageWithPlanAndBalances[],
  ): boolean {
    return memberships.some(
      (membership) =>
        isUserPackageBookableAt(membership, session.startsAt) &&
        membershipCoversSessionType(membership, session.classType) &&
        hasAnyBookableCredit(membership, session.classType),
    );
  }

  private async assertClientExists(clientId: string): Promise<void> {
    const client = await this.prisma.user.findFirst({
      where: { id: clientId, role: Role.USER },
      select: { id: true },
    });
    if (client === null) {
      throw new NotFoundException('Client not found');
    }
  }
}
