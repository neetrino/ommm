import { Injectable } from '@nestjs/common';
import { GiftCardStatus, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DateRangeQueryDto } from './dto/date-range-query.dto';
import {
  aggregatePaymentsBySource,
  buildDailyRevenueFromPayments,
  buildGiftCreditCsvRows,
  formatPersonName,
} from './reports-export.helpers';
import {
  buildPaymentDateFilter,
  detectPaymentSource,
  readGiftAmount,
  resolveRange,
} from './reports.helpers';

const GIFT_CREDIT_CURRENCY = 'amd';

@Injectable()
export class ReportsExportService {
  constructor(private readonly prisma: PrismaService) {}

  async bookingsCsv(from: Date, to: Date): Promise<string> {
    const toSafe = new Date(to);
    const fromSafe = new Date(from);
    if (toSafe < fromSafe) {
      throw new Error('Invalid range');
    }
    const rows = await this.prisma.booking.findMany({
      where: {
        session: { startsAt: { gte: fromSafe, lte: toSafe } },
      },
      include: {
        user: { select: { email: true, name: true } },
        session: { include: { classType: true } },
      },
      take: 5000,
    });
    const header = 'bookingId,userEmail,userName,class,startsAt,status\n';
    const body = rows
      .map((b) =>
        [
          b.id,
          b.user.email,
          b.user.name ?? '',
          b.session.classType.name,
          b.session.startsAt.toISOString(),
          b.status,
        ]
          .map((c) => `"${String(c).replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n');
    return header + body;
  }

  async financeSummary(range: DateRangeQueryDto) {
    const dateFilter = buildPaymentDateFilter(range);
    const where: Prisma.PaymentWhereInput = {
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    };
    const [
      totals,
      byStatusRaw,
      payments,
      issuedGiftCards,
      redeemedGiftCards,
      giftSpentAgg,
      giftLiabilityAgg,
    ] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { ...where, status: PaymentStatus.SUCCEEDED },
        _sum: { amountCents: true },
        _count: { id: true },
      }),
      this.prisma.payment.groupBy({
        by: ['status'],
        where,
        _sum: { amountCents: true },
        _count: { id: true },
      }),
      this.prisma.payment.findMany({
        where,
        select: {
          id: true,
          amountCents: true,
          description: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.giftCard.findMany({
        where: {
          ...(dateFilter ? { createdAt: dateFilter } : {}),
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 10_000,
      }),
      this.prisma.giftCard.findMany({
        where: {
          status: GiftCardStatus.REDEEMED,
          ...(dateFilter ? { updatedAt: dateFilter } : {}),
        },
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        take: 10_000,
      }),
      this.prisma.payment.aggregate({
        where: {
          ...where,
          status: PaymentStatus.SUCCEEDED,
          description: { startsWith: 'Gift credit spend' },
        },
        _sum: { amountCents: true },
        _count: { id: true },
      }),
      this.prisma.user.aggregate({
        _sum: { giftCreditsCents: true },
      }),
    ]);

    const bySource = aggregatePaymentsBySource(payments);

    const byStatus = byStatusRaw.map((entry) => ({
      status: entry.status,
      count: entry._count.id,
      amountCents: entry._sum.amountCents ?? 0,
    }));

    const averageOrderValueCents =
      (totals._count.id ?? 0) > 0
        ? Math.round((totals._sum.amountCents ?? 0) / (totals._count.id ?? 1))
        : 0;
    const issuedCount = issuedGiftCards.length;
    const redeemedCount = redeemedGiftCards.length;
    const issuedCents = issuedGiftCards.reduce(
      (sum, card) => sum + readGiftAmount(card),
      0,
    );
    const redeemedCents = redeemedGiftCards.reduce(
      (sum, card) => sum + readGiftAmount(card),
      0,
    );

    const dailyRevenue = buildDailyRevenueFromPayments(payments);

    return {
      range: resolveRange(range),
      totals: {
        revenueCents: totals._sum.amountCents ?? 0,
        successfulPaymentsCount: totals._count.id ?? 0,
        averageOrderValueCents,
      },
      byStatus,
      bySource,
      dailyRevenue,
      giftCredits: {
        issuedCents,
        issuedCount,
        redeemedCents,
        redeemedCount,
        spentCents: giftSpentAgg._sum.amountCents ?? 0,
        spendTransactionsCount: giftSpentAgg._count.id ?? 0,
        outstandingCreditsCents: giftLiabilityAgg._sum.giftCreditsCents ?? 0,
      },
    };
  }

  async paymentsCsv(range: DateRangeQueryDto): Promise<string> {
    const dateFilter = buildPaymentDateFilter(range);
    const rows = await this.prisma.payment.findMany({
      where: {
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      include: {
        user: { select: { id: true, email: true, name: true, lastName: true } },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 10_000,
    });

    const header =
      'paymentId,createdAt,userId,userEmail,userName,amountCents,currency,status,source,description\n';
    const body = rows
      .map((payment) =>
        [
          payment.id,
          payment.createdAt.toISOString(),
          payment.userId,
          payment.user.email,
          formatPersonName(payment.user.name, payment.user.lastName),
          payment.amountCents,
          payment.currency,
          payment.status,
          detectPaymentSource(payment.description),
          payment.description ?? '',
        ]
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n');
    return header + body;
  }

  async giftCreditsCsv(range: DateRangeQueryDto): Promise<string> {
    const dateFilter = buildPaymentDateFilter(range);
    const [issuedCards, redeemedCards, spendPayments] = await Promise.all([
      this.prisma.giftCard.findMany({
        where: {
          ...(dateFilter ? { createdAt: dateFilter } : {}),
        },
        include: {
          purchaser: {
            select: { id: true, email: true, name: true, lastName: true },
          },
          recipient: {
            select: { id: true, email: true, name: true, lastName: true },
          },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 10_000,
      }),
      this.prisma.giftCard.findMany({
        where: {
          status: GiftCardStatus.REDEEMED,
          ...(dateFilter ? { updatedAt: dateFilter } : {}),
        },
        include: {
          recipient: {
            select: { id: true, email: true, name: true, lastName: true },
          },
        },
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        take: 10_000,
      }),
      this.prisma.payment.findMany({
        where: {
          ...(dateFilter ? { createdAt: dateFilter } : {}),
          status: PaymentStatus.SUCCEEDED,
          description: { startsWith: 'Gift credit spend' },
        },
        include: {
          user: {
            select: { id: true, email: true, name: true, lastName: true },
          },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: 10_000,
      }),
    ]);

    const rows = buildGiftCreditCsvRows({
      issuedCards,
      redeemedCards,
      spendPayments,
      currency: GIFT_CREDIT_CURRENCY,
    });

    const header =
      'eventType,eventAt,userId,userEmail,userName,amountCents,currency,reference,notes\n';
    return header + rows.join('\n');
  }
}
