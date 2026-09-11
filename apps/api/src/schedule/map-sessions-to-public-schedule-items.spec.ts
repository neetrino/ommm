import { ClassSessionStatus } from '@prisma/client';
import { studioWallClockToUtc } from '../common/studio-timezone';
import { mapSessionsToPublicScheduleItems } from './map-sessions-to-public-schedule-items';

describe('mapSessionsToPublicScheduleItems', () => {
  const baseDate = new Date('2026-06-02T09:00:00.000Z');

  it('maps active and finished sessions and excludes draft or cancelled', () => {
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
        classType: { name: 'Yoga', description: null },
        coach: {
          bio: null,
          user: { name: 'Alex', lastName: 'Coach', avatarUrl: null },
        },
        _count: { bookings: 3 },
      },
      {
        id: 'finished-1',
        title: 'Earlier Class',
        description: null,
        startsAt: new Date('2026-06-01T09:00:00.000Z'),
        endsAt: new Date('2026-06-01T10:00:00.000Z'),
        capacity: 10,
        level: null,
        status: ClassSessionStatus.FINISHED,
        createdAt: baseDate,
        updatedAt: baseDate,
        classType: { name: 'Pilates', description: null },
        coach: {
          bio: null,
          user: { name: 'Alex', lastName: 'Coach', avatarUrl: null },
        },
        _count: { bookings: 2 },
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
        classType: { name: 'Yoga', description: null },
        coach: {
          bio: null,
          user: { name: 'Alex', lastName: 'Coach', avatarUrl: null },
        },
        _count: { bookings: 0 },
      },
    ]);

    expect(items).toHaveLength(2);
    expect(items[0]?.className).toBe('Morning Flow');
    expect(items[0]?.instructorName).toBe('Alex Coach');
    expect(items[0]?.instructorAvatarUrl).toBeNull();
    expect(items[0]?.instructorBio).toBeNull();
    expect(items[0]?.classTypeDescription).toBeNull();
    expect(items[0]?.availableSpots).toBe(9);
    expect(items[0]?.dayOfWeek).toBe('TUESDAY');
    expect(items[0]?.startTime).toBe('13:00');
    expect(items[0]?.level).toBe('Beginner');
    expect(items[0]?.status).toBe(ClassSessionStatus.ACTIVE);
    expect(items[0]?.sessionDate).toBe('2026-06-02');
    expect(items[1]?.id).toBe('finished-1');
    expect(items[1]?.status).toBe(ClassSessionStatus.FINISHED);
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
        classType: { name: 'Pilates', description: null },
        coach: {
          bio: 'Studio coach',
          user: {
            name: 'Sam',
            lastName: null,
            avatarUrl: 'https://cdn.example/sam.jpg',
          },
        },
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
        classType: { name: 'Pilates', description: null },
        coach: {
          bio: 'Studio coach',
          user: {
            name: 'Sam',
            lastName: null,
            avatarUrl: 'https://cdn.example/sam.jpg',
          },
        },
        _count: { bookings: 0 },
      },
    ]);

    expect(items).toHaveLength(2);
    expect(items.map((item) => item.id)).toEqual(['week-1', 'week-2']);
    expect(items[0]?.instructorAvatarUrl).toBe('https://cdn.example/sam.jpg');
    expect(items[0]?.instructorBio).toBe('Studio coach');
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
        classType: { name: 'Dance', description: null },
        coach: {
          bio: null,
          user: { name: 'Coach', lastName: 'Example', avatarUrl: null },
        },
        _count: { bookings: 0 },
      },
    ]);

    expect(items[0]?.sessionDate).toBe('2026-06-15');
    expect(items[0]?.startTime).toBe('20:30');
    expect(items[0]?.endTime).toBe('21:30');
    expect(items[0]?.dayOfWeek).toBe('MONDAY');
  });

  it('attaches class type description from the linked type', () => {
    const items = mapSessionsToPublicScheduleItems([
      {
        id: 'dances-1',
        title: 'Dances',
        description: 'session note',
        startsAt: baseDate,
        endsAt: new Date('2026-06-02T10:00:00.000Z'),
        capacity: 10,
        level: null,
        status: ClassSessionStatus.ACTIVE,
        createdAt: baseDate,
        updatedAt: baseDate,
        classType: {
          name: 'Group Dances',
          description: 'Latina group classes for all levels.',
        },
        coach: {
          bio: null,
          user: { name: 'Inesa', lastName: 'Hakobyan', avatarUrl: null },
        },
        _count: { bookings: 0 },
      },
    ]);

    expect(items[0]?.classTypeDescription).toBe(
      'Latina group classes for all levels.',
    );
    expect(items[0]?.description).toBe('session note');
  });

  it('trims blank class type description to null', () => {
    const items = mapSessionsToPublicScheduleItems([
      {
        id: 'reformer-1',
        title: 'Reformer Group',
        description: null,
        startsAt: baseDate,
        endsAt: new Date('2026-06-02T10:00:00.000Z'),
        capacity: 10,
        level: 'All levels',
        status: ClassSessionStatus.ACTIVE,
        createdAt: baseDate,
        updatedAt: baseDate,
        classType: { name: 'Reformer Group', description: '   ' },
        coach: {
          bio: null,
          user: { name: 'Sam', lastName: null, avatarUrl: null },
        },
        _count: { bookings: 0 },
      },
    ]);

    expect(items[0]?.classTypeDescription).toBeNull();
  });
});
