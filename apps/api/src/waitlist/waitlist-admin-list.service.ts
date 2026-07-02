import { Injectable } from '@nestjs/common';
import { WaitlistStatus } from '@prisma/client';
import { DEFAULT_LIST_PAGE_SIZE } from '../common/dto/list-pagination-query.dto';
import { resolveWaitlistAdminOrderBy } from '../common/list-order.helpers';
import { PrismaService } from '../prisma/prisma.service';
import { AdminWaitlistActiveQueryDto } from './dto/admin-waitlist-active-query.dto';

@Injectable()
export class WaitlistAdminListService {
  constructor(private readonly prisma: PrismaService) {}

  async listAdminActive(query: AdminWaitlistActiveQueryDto = {}) {
    const hasPagination =
      query.take !== undefined || query.offset !== undefined;
    const activeStatuses = [WaitlistStatus.ACTIVE, WaitlistStatus.OFFERED];
    const where = { status: { in: activeStatuses } };
    const orderBy = resolveWaitlistAdminOrderBy(query.order);
    const include = {
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
        select: {
          id: true,
          startsAt: true,
          classType: {
            select: { id: true, name: true },
          },
        },
      },
    };

    if (!hasPagination) {
      const take = Math.min(Math.max(query.take ?? 200, 1), 500);
      const entries = await this.prisma.waitlistEntry.findMany({
        where,
        orderBy,
        take,
        include,
      });
      return this.mapAdminActiveEntries(entries);
    }

    const take = query.take ?? DEFAULT_LIST_PAGE_SIZE;
    const offset = query.offset ?? 0;
    const [entries, total] = await Promise.all([
      this.prisma.waitlistEntry.findMany({
        where,
        orderBy,
        take,
        skip: offset,
        include,
      }),
      this.prisma.waitlistEntry.count({ where }),
    ]);
    const items = await this.mapAdminActiveEntries(entries);
    return { items, total, take, offset };
  }

  private async mapAdminActiveEntries(
    entries: {
      id: string;
      status: WaitlistStatus;
      createdAt: Date;
      offeredAt: Date | null;
      offerExpiresAt: Date | null;
      sessionId: string;
      user: {
        id: string;
        name: string | null;
        lastName: string | null;
        email: string;
        phone: string | null;
      };
      session: {
        id: string;
        startsAt: Date;
        classType: { id: string; name: string };
      };
    }[],
  ) {
    if (entries.length === 0) {
      return [];
    }
    const activeStatuses = [WaitlistStatus.ACTIVE, WaitlistStatus.OFFERED];
    const sessionIds = [...new Set(entries.map((entry) => entry.sessionId))];
    const counts = await this.prisma.waitlistEntry.groupBy({
      by: ['sessionId'],
      where: {
        sessionId: { in: sessionIds },
        status: { in: activeStatuses },
      },
      _count: {
        _all: true,
      },
    });
    const countBySessionId = new Map(
      counts.map((item) => [item.sessionId, item._count._all]),
    );
    return entries.map((entry) => ({
      id: entry.id,
      status: entry.status,
      waitlistDate: entry.createdAt,
      offeredAt: entry.offeredAt,
      offerExpiresAt: entry.offerExpiresAt,
      sessionWaitlistCount: countBySessionId.get(entry.sessionId) ?? 0,
      user: {
        id: entry.user.id,
        name: entry.user.name,
        lastName: entry.user.lastName,
        email: entry.user.email,
        phone: entry.user.phone,
      },
      session: {
        id: entry.session.id,
        startsAt: entry.session.startsAt,
        classType: {
          id: entry.session.classType.id,
          name: entry.session.classType.name,
        },
      },
    }));
  }
}
