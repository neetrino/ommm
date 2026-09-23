import { Injectable } from '@nestjs/common';
import { ClientRegistrationSource, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { joinName, resolveRange } from './reports.helpers';
import type { DateRangeQueryDto } from './dto/date-range-query.dto';

export type ManagerInviteReferredUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type ManagerInviteAnalyticsRow = {
  id: string;
  name: string;
  email: string;
  isBlocked: boolean;
  referredCount: number;
  referredUsers: ManagerInviteReferredUser[];
};

export type ManagerInvitesAnalyticsPayload = {
  range: { from: string; to: string };
  totals: {
    managers: number;
    referredInRange: number;
  };
  managers: ManagerInviteAnalyticsRow[];
};

@Injectable()
export class ManagerInvitesAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Per-manager client-invite registrations in the selected range
   * (completed signups via `?ref=` — not raw link clicks).
   */
  async managerInvites(
    query: DateRangeQueryDto,
  ): Promise<ManagerInvitesAnalyticsPayload> {
    const resolved = resolveRange(query);
    const from = new Date(resolved.from);
    const to = new Date(resolved.to);

    const managers = await this.prisma.user.findMany({
      where: { role: Role.MANAGER },
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        isBlocked: true,
      },
      orderBy: [{ name: 'asc' }, { email: 'asc' }],
    });

    if (managers.length === 0) {
      return {
        range: { from: from.toISOString(), to: to.toISOString() },
        totals: { managers: 0, referredInRange: 0 },
        managers: [],
      };
    }

    const managerIds = managers.map((manager) => manager.id);
    const referred = await this.prisma.user.findMany({
      where: {
        registeredById: { in: managerIds },
        registrationSource: ClientRegistrationSource.INVITE,
        createdAt: { gte: from, lte: to },
      },
      select: {
        id: true,
        name: true,
        lastName: true,
        email: true,
        createdAt: true,
        registeredById: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const byManager = new Map<string, ManagerInviteReferredUser[]>();
    for (const user of referred) {
      const referrerId = user.registeredById;
      if (!referrerId) {
        continue;
      }
      const list = byManager.get(referrerId) ?? [];
      list.push({
        id: user.id,
        name: joinName(user.name, user.lastName, user.email),
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      });
      byManager.set(referrerId, list);
    }

    const rows: ManagerInviteAnalyticsRow[] = managers.map((manager) => {
      const referredUsers = byManager.get(manager.id) ?? [];
      return {
        id: manager.id,
        name: joinName(manager.name, manager.lastName, manager.email),
        email: manager.email,
        isBlocked: manager.isBlocked,
        referredCount: referredUsers.length,
        referredUsers,
      };
    });

    rows.sort((a, b) => {
      if (b.referredCount !== a.referredCount) {
        return b.referredCount - a.referredCount;
      }
      return a.name.localeCompare(b.name);
    });

    return {
      range: { from: from.toISOString(), to: to.toISOString() },
      totals: {
        managers: rows.length,
        referredInRange: referred.length,
      },
      managers: rows,
    };
  }
}
