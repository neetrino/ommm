import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take,
      }),
    ]);
    return { items: rows, total, take, offset };
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
