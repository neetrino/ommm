import { BookingStatus } from '@prisma/client';
import {
  aggregateCoachAnalytics,
  buildEmptyCoachAnalytics,
} from './coach-analytics.aggregate';

describe('coach-analytics.aggregate', () => {
  const range = {
    from: new Date('2026-06-01T00:00:00.000Z'),
    to: new Date('2026-06-07T23:59:59.000Z'),
  };

  it('buildEmptyCoachAnalytics returns zeroed payload', () => {
    const result = buildEmptyCoachAnalytics(range, 30);
    expect(result.totals.totalClassesTaught).toBe(0);
    expect(result.hourlyAttendance).toHaveLength(24);
  });

  it('aggregateCoachAnalytics computes metrics from occupied bookings', () => {
    const startsAt = new Date('2026-06-02T18:30:00.000Z');
    const result = aggregateCoachAnalytics(
      range,
      30,
      [
        {
          id: 's1',
          capacity: 10,
          startsAt,
          classTypeId: 'ct1',
          classTypeName: 'Vinyasa',
        },
      ],
      [
        {
          sessionId: 's1',
          userId: 'u1',
          status: BookingStatus.COMPLETED,
        },
        {
          sessionId: 's1',
          userId: 'u2',
          status: BookingStatus.MISSED,
        },
      ],
      [{ sessionId: 's1' }],
    );

    expect(result.totals.totalClassesTaught).toBe(1);
    expect(result.totals.totalClientsTrained).toBe(1);
    expect(result.totals.bookings).toBe(2);
    expect(result.totals.completed).toBe(1);
    expect(result.totals.missed).toBe(1);
    expect(result.totals.averageAttendanceRate).toBe(50);
    expect(result.totals.classFillRate).toBe(20);
    expect(result.totals.mostPopularClassType).toBe('Vinyasa');
    expect(result.totals.peakTime?.attendance).toBe(1);
    expect(result.classTypeBreakdown[0]?.attendance).toBe(1);
  });
});
