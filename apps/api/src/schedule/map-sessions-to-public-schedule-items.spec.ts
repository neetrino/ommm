import { ClassSessionStatus } from '@prisma/client';
import { studioWallClockToUtc } from '../common/studio-timezone';
import { mapSessionsToPublicScheduleItems } from './map-sessions-to-public-schedule-items';

describe('mapSessionsToPublicScheduleItems', () => {
  const baseDate = new Date('2026-06-02T09:00:00.000Z');

  it('maps active sessions and excludes draft or cancelled', () => {
    const items = mapSessionsToPublicScheduleItems([
      {
        id: 'active-1',
        title: 'Morning Flow',
        description: null,
        startsAt: baseDate,
        endsAt: new Date('2026-06-02T10:00:00.000Z'),
        capacity: 12,
        level: 'Beginner',
        status: ClassSessionStatus.ACTIVE,
        createdAt: baseDate,
        updatedAt: baseDate,
        classType: { name: 'Yoga' },
        coach: { user: { name: 'Alex', lastName: 'Coach' } },
        _count: { bookings: 3 },
      },
      {
        id: 'draft-1',
        title: 'Hidden',
        description: null,
        startsAt: baseDate,
        endsAt: new Date('2026-06-02T10:00:00.000Z'),
        capacity: 8,
        level: null,
        status: ClassSessionStatus.DRAFT,
        createdAt: baseDate,
        updatedAt: baseDate,
        classType: { name: 'Yoga' },
        coach: { user: { name: 'Alex', lastName: 'Coach' } },
        _count: { bookings: 0 },
      },
    ]);

    expect(items).toHaveLength(1);
    expect(items[0]?.className).toBe('Morning Flow');
    expect(items[0]?.instructorName).toBe('Alex Coach');
    expect(items[0]?.availableSpots).toBe(9);
    expect(items[0]?.dayOfWeek).toBe('TUESDAY');
    expect(items[0]?.startTime).toBe('13:00');
    expect(items[0]?.level).toBe('Beginner');
    expect(items[0]?.status).toBe(ClassSessionStatus.ACTIVE);
    expect(items[0]?.sessionDate).toBe('2026-06-02');
  });

  it('keeps repeated weekly slots as separate bookable sessions', () => {
    const secondWeek = new Date('2026-06-09T09:00:00.000Z');
    const items = mapSessionsToPublicScheduleItems([
      {
        id: 'week-1',
        title: 'Pilates',
        description: null,
        startsAt: baseDate,
        endsAt: new Date('2026-06-02T10:00:00.000Z'),
        capacity: 10,
        level: null,
        status: ClassSessionStatus.ACTIVE,
        createdAt: baseDate,
        updatedAt: baseDate,
        classType: { name: 'Pilates' },
        coach: { user: { name: 'Sam', lastName: null } },
        _count: { bookings: 0 },
      },
      {
        id: 'week-2',
        title: 'Pilates',
        description: null,
        startsAt: secondWeek,
        endsAt: new Date('2026-06-09T10:00:00.000Z'),
        capacity: 10,
        level: null,
        status: ClassSessionStatus.ACTIVE,
        createdAt: secondWeek,
        updatedAt: secondWeek,
        classType: { name: 'Pilates' },
        coach: { user: { name: 'Sam', lastName: null } },
        _count: { bookings: 0 },
      },
    ]);

    expect(items).toHaveLength(2);
    expect(items.map((item) => item.id)).toEqual(['week-1', 'week-2']);
  });

  it('maps admin wall-clock times into studio timezone fields', () => {
    const startsAt = studioWallClockToUtc('2026-06-15', '20:30');
    const items = mapSessionsToPublicScheduleItems([
      {
        id: 'evening-1',
        title: 'Evening Dance',
        description: null,
        startsAt,
        endsAt: studioWallClockToUtc('2026-06-15', '21:30'),
        capacity: 10,
        level: null,
        status: ClassSessionStatus.ACTIVE,
        createdAt: startsAt,
        updatedAt: startsAt,
        classType: { name: 'Dance' },
        coach: { user: { name: 'Coach', lastName: 'Example' } },
        _count: { bookings: 0 },
      },
    ]);

    expect(items[0]?.sessionDate).toBe('2026-06-15');
    expect(items[0]?.startTime).toBe('20:30');
    expect(items[0]?.endTime).toBe('21:30');
    expect(items[0]?.dayOfWeek).toBe('MONDAY');
  });
});
