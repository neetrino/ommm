import { Injectable } from '@nestjs/common';
import {
  endOfStudioDayInclusive,
  startOfStudioDay,
  utcToStudioCalendarDate,
} from '../common/studio-timezone';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildDailyFinanceReport,
  DailyFinanceReport,
} from './manager-daily-finance.aggregate';

@Injectable()
export class ManagerDailyFinanceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Aggregated finance for the current studio calendar day only.
   * The day is resolved server-side so callers cannot request other periods.
   */
  async today(now: Date = new Date()): Promise<DailyFinanceReport> {
    const rows = await this.prisma.payment.groupBy({
      by: ['status', 'paymentMethod'],
      where: {
        createdAt: {
          gte: startOfStudioDay(now),
          lte: endOfStudioDayInclusive(now),
        },
      },
      _count: { id: true },
      _sum: { amountCents: true },
    });
    return buildDailyFinanceReport(utcToStudioCalendarDate(now), rows);
  }
}
