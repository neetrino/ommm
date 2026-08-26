import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PaymentSource,
  Prisma,
  Role,
  SessionReviewStatus,
} from '@prisma/client';
import {
  SessionListOrder,
  sortRowsBySessionStartsAt,
} from '../common/list-order.helpers';
import { PrismaService } from '../prisma/prisma.service';
import { toUserPackageActivationApi } from '../packages/packages-activation.helpers';
import { toUserPackageGuestPassApi } from '../packages/packages-guest-pass.helpers';
import { toUserPackageFreezeApi } from '../packages/packages-freeze.mapper';
import { resumeDueFreezes } from '../packages/packages-freeze.resume';
import { resolveUserPackagePlan } from '../packages/user-package-plan-snapshot.util';
import {
  buildVisibleUserPackagesWhere,
  compareUserPackagesForClientList,
  loadSucceededPackageSourceIds,
} from '../packages/user-package-list.util';
import {
  mapClientPackageTypeBalances,
  type ClientPackageTypeBalanceItem,
} from './clients-package-type-balances.util';

const bookingInclude = Prisma.validator<Prisma.BookingInclude>()({
  session: {
    include: {
      classType: { select: { name: true } },
      coach: {
        include: {
          user: { select: { name: true, lastName: true } },
        },
      },
    },
  },
});

type BookingRecord = Prisma.BookingGetPayload<{
  include: typeof bookingInclude;
}>;

type ClientBookingsPage = {
  items: Array<{
    id: string;
    status: string;
    channel: string;
    attendedAt: Date | null;
    cancelledAt: Date | null;
    createdAt: Date;
    guestName: string | null;
    guestPassSlot: number;
    session: BookingRecord['session'];
  }>;
  total: number;
  take: number;
  offset: number;
};

type ClientPaymentsPage = {
  items: Array<{
    id: string;
    amountCents: number;
    currency: string;
    status: string;
    description: string | null;
    paymentMethod: string | null;
    createdAt: Date;
  }>;
  total: number;
  take: number;
  offset: number;
};

type ClientGiftCardsPage = {
  items: Array<{
    id: string;
    amountCents: number;
    balanceCents: number;
    status: string;
    recipientEmail: string | null;
    recipientName: string | null;
    createdAt: Date;
    relation: 'purchased' | 'received';
  }>;
  total: number;
  take: number;
  offset: number;
};

type ClientPackagesPage = {
  items: Array<{
    id: string;
    status: string;
    packageName: string;
    categoryName: string;
    activationDate: string;
    expirationDate: string;
    totalSessions: number | null;
    usedSessions: number | null;
    remainingSessions: number | null;
    isUnlimited: boolean;
    guestSlotsTotal: number;
    guestSlotsRemaining: number;
    paymentMethod: string | null;
    typeBalances: ClientPackageTypeBalanceItem[];
    freeze: {
      allowedCount: number;
      maxDaysPerUse: number;
      usedCount: number;
      remainingCount: number;
      pausedAt: string | null;
      pausedUntil: string | null;
      canFreeze: boolean;
      canUnfreeze: boolean;
    };
  }>;
  total: number;
  take: number;
  offset: number;
};

type ClientFeedbackPage = {
  items: Array<{
    id: string;
    classTypeName: string;
    startsAt: Date;
    endsAt: Date;
    coachName: string;
    rating: number;
    comment: string | null;
    submittedAt: Date;
  }>;
  total: number;
  take: number;
  offset: number;
};

@Injectable()
export class ClientsTabListsService {
  constructor(private readonly prisma: PrismaService) {}

  async listBookings(
    userId: string,
    take: number,
    offset: number,
  ): Promise<ClientBookingsPage> {
    await this.assertClientExists(userId);
    const rows = await this.prisma.booking.findMany({
      where: { userId },
      include: bookingInclude,
    });
    const sorted = sortRowsBySessionStartsAt(rows, SessionListOrder.UPCOMING);
    return {
      items: sorted.slice(offset, offset + take),
      total: sorted.length,
      take,
      offset,
    };
  }

  async listPayments(
    userId: string,
    take: number,
    offset: number,
  ): Promise<ClientPaymentsPage> {
    await this.assertClientExists(userId);
    const where = { userId };
    const [total, rows] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        select: {
          id: true,
          amountCents: true,
          currency: true,
          status: true,
          description: true,
          paymentMethod: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take,
      }),
    ]);
    return { items: rows, total, take, offset };
  }

  async listPackages(
    userId: string,
    take: number,
    offset: number,
  ): Promise<ClientPackagesPage> {
    await this.assertClientExists(userId);
    await resumeDueFreezes(this.prisma, { userId });
    const succeededPackageIds = await loadSucceededPackageSourceIds(
      this.prisma,
      userId,
    );
    const where = buildVisibleUserPackagesWhere(userId, succeededPackageIds);
    const allRows = await this.prisma.userPackage.findMany({
      where,
      include: {
        plan: true,
        balances: {
          select: {
            id: true,
            sourceCategoryNameSnapshot: true,
            sessionsTotal: true,
            sessionsUsed: true,
            sessionsRemaining: true,
            isUnlimited: true,
            classType: { select: { name: true } },
          },
        },
      },
    });
    allRows.sort(compareUserPackagesForClientList);
    const total = allRows.length;
    const rows = allRows.slice(offset, offset + take);

    const packageIds = rows.map((row) => row.id);
    const payments =
      packageIds.length === 0
        ? []
        : await this.prisma.payment.findMany({
            where: {
              source: PaymentSource.PACKAGE,
              sourceId: { in: packageIds },
            },
            select: {
              sourceId: true,
              paymentMethod: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
          });

    const paymentMethodByPackageId = new Map<string, string | null>();
    for (const payment of payments) {
      if (payment.sourceId === null) {
        continue;
      }
      if (!paymentMethodByPackageId.has(payment.sourceId)) {
        paymentMethodByPackageId.set(payment.sourceId, payment.paymentMethod);
      }
    }

    return {
      items: rows.map((row) => {
        const resolvedPlan = resolveUserPackagePlan({
          plan: row.plan,
          snapshots: row,
        });
        const usedSessions =
          row.sessionsTotal === null || row.sessionsRemaining === null
            ? null
            : Math.max(row.sessionsTotal - row.sessionsRemaining, 0);
        return {
          id: row.id,
          status: row.status,
          packageName: resolvedPlan.name,
          categoryName: resolvedPlan.categoryName,
          activationDate: row.currentPeriodStart.toISOString(),
          expirationDate: row.currentPeriodEnd.toISOString(),
          ...toUserPackageActivationApi(row),
          ...toUserPackageGuestPassApi(row),
          totalSessions: row.sessionsTotal,
          usedSessions,
          remainingSessions: row.sessionsRemaining,
          isUnlimited: resolvedPlan.isUnlimited,
          paymentMethod: paymentMethodByPackageId.get(row.id) ?? null,
          typeBalances: mapClientPackageTypeBalances(row.balances),
          freeze: toUserPackageFreezeApi(row, row.plan, {
            allowAdminOverride: true,
          }),
        };
      }),
      total,
      take,
      offset,
    };
  }

  async listGiftCards(
    userId: string,
    take: number,
    offset: number,
  ): Promise<ClientGiftCardsPage> {
    await this.assertClientExists(userId);
    const where: Prisma.GiftCardWhereInput = {
      OR: [{ purchaserId: userId }, { recipientId: userId }],
    };
    const [total, rows] = await Promise.all([
      this.prisma.giftCard.count({ where }),
      this.prisma.giftCard.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take,
      }),
    ]);
    return {
      items: rows.map((card) => ({
        id: card.id,
        amountCents: card.amountAmd,
        balanceCents: card.balanceAmd,
        status: card.status,
        recipientEmail: card.recipientEmail,
        recipientName: card.recipientName,
        createdAt: card.createdAt,
        relation: card.purchaserId === userId ? 'purchased' : 'received',
      })),
      total,
      take,
      offset,
    };
  }

  async listFeedback(
    userId: string,
    take: number,
    offset: number,
  ): Promise<ClientFeedbackPage> {
    await this.assertClientExists(userId);
    const where: Prisma.SessionReviewWhereInput = {
      authorUserId: userId,
      status: SessionReviewStatus.SUBMITTED,
      isAnonymous: false,
    };
    const [total, rows] = await Promise.all([
      this.prisma.sessionReview.count({ where }),
      this.prisma.sessionReview.findMany({
        where,
        include: {
          session: {
            select: {
              startsAt: true,
              endsAt: true,
              classType: { select: { name: true } },
            },
          },
          coachProfile: {
            select: {
              user: { select: { name: true, lastName: true } },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
        skip: offset,
        take,
      }),
    ]);
    return {
      items: rows.map((row) => ({
        id: row.id,
        classTypeName: row.session.classType.name,
        startsAt: row.session.startsAt,
        endsAt: row.session.endsAt,
        coachName: [row.coachProfile.user.name, row.coachProfile.user.lastName]
          .filter(Boolean)
          .join(' ')
          .trim(),
        rating: row.rating ?? 0,
        comment: row.comment,
        submittedAt: row.submittedAt ?? row.updatedAt,
      })),
      total,
      take,
      offset,
    };
  }

  private async assertClientExists(id: string): Promise<void> {
    const exists = await this.prisma.user.findFirst({
      where: { id, role: Role.USER },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException();
    }
  }
}
