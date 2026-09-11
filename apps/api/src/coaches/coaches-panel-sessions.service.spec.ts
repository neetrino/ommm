import { ClassSessionStatus } from '@prisma/client';
import { CoachesPanelSessionsService } from './coaches-panel-sessions.service';

describe('CoachesPanelSessionsService', () => {
  it('returns null when the user has no coach profile', async () => {
    const service = new CoachesPanelSessionsService({
      coachProfile: { findUnique: jest.fn().mockResolvedValue(null) },
    } as never);

    await expect(service.listForUser('user-1')).resolves.toBeNull();
  });

  it('lists only the current coach sessions across the history window', async () => {
    const findUnique = jest.fn().mockResolvedValue({ id: 'coach-1' });
    const findMany = jest.fn().mockResolvedValue([
      {
        id: 'session-1',
        title: 'Reformer',
        startsAt: new Date('2026-08-01T08:00:00.000Z'),
        endsAt: new Date('2026-08-01T09:00:00.000Z'),
        capacity: 8,
        level: null,
        classFormat: null,
        status: ClassSessionStatus.FINISHED,
        classType: { id: 'type-1', name: 'Reformer' },
        coach: { id: 'coach-1', user: { name: 'Ana', lastName: 'Coach' } },
        _count: { bookings: 5 },
      },
    ]);
    const service = new CoachesPanelSessionsService({
      coachProfile: { findUnique },
      classSession: { findMany },
    } as never);

    const rows = await service.listForUser('user-1');

    expect(findUnique).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      select: { id: true },
    });
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ coachId: 'coach-1' }),
      }),
    );
    expect(rows).toEqual([
      expect.objectContaining({
        id: 'session-1',
        status: ClassSessionStatus.FINISHED,
        _count: { bookings: 5 },
      }),
    ]);
  });
});
