import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentSource, Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
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
    paymentMethod: string | null;
    typeBalances: ClientPackageTypeBalanceItem[];
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
    const where = { userId };
    const [total, items] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        include: bookingInclude,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take,
      }),
    ]);
    return { items, total, take, offset };
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
          totalSessions: row.sessionsTotal,
          usedSessions,
          remainingSessions: row.sessionsRemaining,
          isUnlimited: resolvedPlan.isUnlimited,
          paymentMethod: paymentMethodByPackageId.get(row.id) ?? null,
          typeBalances: mapClientPackageTypeBalances(row.balances),
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
