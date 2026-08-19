import { Injectable } from '@nestjs/common';
import {
  BookingStatus,
  ClassSessionStatus,
  PaymentStatus,
} from '@prisma/client';
import { isInfluencerPaymentMethod } from '../payments/payment-revenue.util';
import { PrismaService } from '../prisma/prisma.service';
import {
  aggregateCoachAnalytics,
  buildEmptyCoachAnalytics,
} from './coach-analytics.aggregate';
import { resolveRelativeDays } from './reports.helpers';

@Injectable()
export class ReportsAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async coachAnalytics(userId: string, days: number) {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      return null;
    }

    const safeDays = Math.min(Math.max(days, 7), 365);
    const range = resolveRelativeDays(safeDays);
    const sessions = await this.prisma.classSession.findMany({
      where: {
        coachId: profile.id,
        startsAt: { gte: range.from, lte: range.to },
        status: { not: ClassSessionStatus.CANCELLED },
      },
      select: {
        id: true,
        capacity: true,
        startsAt: true,
        classTypeId: true,
        classType: { select: { name: true } },
      },
      orderBy: { startsAt: 'asc' },
    });

    if (sessions.length === 0) {
      return buildEmptyCoachAnalytics(range, safeDays);
    }

    const sessionIds = sessions.map((session) => session.id);
    const [bookings, waitlists] = await Promise.all([
      this.prisma.booking.findMany({
        where: { sessionId: { in: sessionIds } },
        select: { sessionId: true, userId: true, status: true },
      }),
      this.prisma.waitlistEntry.findMany({
        where: { sessionId: { in: sessionIds }, status: 'ACTIVE' },
        select: { sessionId: true },
      }),
    ]);

    return aggregateCoachAnalytics(
      range,
      safeDays,
      sessions.map((session) => ({
        id: session.id,
        capacity: session.capacity,
        startsAt: session.startsAt,
        classTypeId: session.classTypeId,
        classTypeName: session.classType.name,
      })),
      bookings,
      waitlists,
    );
  }

  async userAnalytics(userId: string, days: number) {
    const range = resolveRelativeDays(days);
    const [bookings, payments] = await Promise.all([
      this.prisma.booking.findMany({
        where: {
          userId,
          session: { startsAt: { gte: range.from, lte: range.to } },
        },
        select: {
          id: true,
          status: true,
          session: {
            select: {
              startsAt: true,
              endsAt: true,
              classType: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.payment.findMany({
        where: {
          userId,
          createdAt: { gte: range.from, lte: range.to },
          status: PaymentStatus.SUCCEEDED,
        },
        select: {
          amountCents: true,
          createdAt: true,
          description: true,
          paymentMethod: true,
        },
      }),
    ]);
    const revenuePayments = payments.filter(
      (payment) => !isInfluencerPaymentMethod(payment.paymentMethod),
    );

    const completed = bookings.filter(
      (b) => b.status === BookingStatus.COMPLETED,
    );
    const completedHours = completed.reduce((sum, booking) => {
      const start = booking.session.startsAt.getTime();
      const end = booking.session.endsAt.getTime();
      return sum + Math.max(0, end - start) / 1000 / 60 / 60;
    }, 0);
    const activeDays = new Set(
      completed.map((b) => b.session.startsAt.toDateString()),
    ).size;
    const classTypeCounter = new Map<string, number>();
    for (const booking of completed) {
      const key = booking.session.classType.name;
      classTypeCounter.set(key, (classTypeCounter.get(key) ?? 0) + 1);
    }
    const favoriteClassType = [...classTypeCounter.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0];
    const spendCents = revenuePayments.reduce(
      (sum, payment) => sum + payment.amountCents,
      0,
    );

    const spendTrendMap = new Map<string, number>();
    for (const payment of revenuePayments) {
      const key = payment.createdAt.toISOString().slice(0, 10);
      spendTrendMap.set(
        key,
        (spendTrendMap.get(key) ?? 0) + payment.amountCents,
      );
    }
    const attendanceTrendMap = new Map<string, number>();
    for (const booking of completed) {
      const key = booking.session.startsAt.toISOString().slice(0, 10);
      attendanceTrendMap.set(key, (attendanceTrendMap.get(key) ?? 0) + 1);
    }

    return {
      range,
      totals: {
        completedClasses: completed.length,
        totalHours: Number(completedHours.toFixed(1)),
        activeDays,
        favoriteClassType,
        spendCents,
      },
      trend: {
        attendance: [...attendanceTrendMap.entries()].map(([date, count]) => ({
          date,
          count,
        })),
        spend: [...spendTrendMap.entries()].map(([date, amountCents]) => ({
          date,
          amountCents,
        })),
      },
    };
  }
}
