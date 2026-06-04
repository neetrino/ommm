import { ClassSessionStatus } from '@prisma/client';
import { mapSessionsToPublicScheduleItems } from './map-sessions-to-public-schedule-items';

describe('mapSessionsToPublicScheduleItems', () => {
  const baseDate = new Date('2026-06-02T09:00:00');

  it('maps active sessions and excludes draft or cancelled', () => {
    const items = mapSessionsToPublicScheduleItems([
      {
        id: 'active-1',
        title: 'Morning Flow',
        description: null,
        startsAt: baseDate,
        endsAt: new Date('2026-06-02T10:00:00'),
        capacity: 12,
        level: 'Beginner',
        status: ClassSessionStatus.ACTIVE,
        createdAt: baseDate,
        updatedAt: baseDate,
        classType: { name: 'Yoga' },
        coach: { user: { name: 'Alex Coach' } },
        _count: { bookings: 3 },
      },
      {
        id: 'draft-1',
        title: 'Hidden',
        description: null,
        startsAt: baseDate,
        endsAt: new Date('2026-06-02T10:00:00'),
        capacity: 8,
        level: null,
        status: ClassSessionStatus.DRAFT,
        createdAt: baseDate,
        updatedAt: baseDate,
        classType: { name: 'Yoga' },
        coach: { user: { name: 'Alex Coach' } },
        _count: { bookings: 0 },
      },
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]?.className).toBe('Morning Flow');
    expect(items[0]?.availableSpots).toBe(9);
    expect(items[0]?.dayOfWeek).toBe('TUESDAY');
    expect(items[0]?.startTime).toBe('09:00');
    expect(items[0]?.level).toBe('Beginner');
    expect(items[0]?.status).toBe(ClassSessionStatus.ACTIVE);
    expect(items[0]?.sessionDate).toBe(baseDate.toISOString());
  });

  it('keeps repeated weekly slots as separate bookable sessions', () => {
    const secondWeek = new Date('2026-06-09T09:00:00');
    const items = mapSessionsToPublicScheduleItems([
      {
        id: 'week-1',
        title: 'Pilates',
        description: null,
        startsAt: baseDate,
        endsAt: new Date('2026-06-02T10:00:00'),
        capacity: 10,
        level: null,
        status: ClassSessionStatus.ACTIVE,
        createdAt: baseDate,
        updatedAt: baseDate,
        classType: { name: 'Pilates' },
        coach: { user: { name: 'Sam' } },
        _count: { bookings: 0 },
      },
      {
        id: 'week-2',
        title: 'Pilates',
        description: null,
        startsAt: secondWeek,
        endsAt: new Date('2026-06-09T10:00:00'),
        capacity: 10,
        level: null,
        status: ClassSessionStatus.ACTIVE,
        createdAt: secondWeek,
        updatedAt: secondWeek,
        classType: { name: 'Pilates' },
        coach: { user: { name: 'Sam' } },
        _count: { bookings: 0 },
      },
    ]);

    expect(items).toHaveLength(2);
    expect(items.map((item) => item.id)).toEqual(['week-1', 'week-2']);
  });
});
