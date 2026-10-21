import { NotFoundException } from '@nestjs/common';
import { CoachesPanelClientsService } from './coaches-panel-clients.service';

describe('CoachesPanelClientsService', () => {
  it('rejects when the user has no coach profile', async () => {
    const service = new CoachesPanelClientsService({
      coachProfile: { findUnique: jest.fn().mockResolvedValue(null) },
    } as never);

    await expect(service.listForUser('user-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('lists only clients who booked this coach', async () => {
    const findUnique = jest.fn().mockResolvedValue({ id: 'coach-1' });
    const findMany = jest.fn().mockResolvedValue([
      {
        id: 'client-1',
        name: 'Anna',
        lastName: 'Lee',
        bookings: [
          { session: { startsAt: new Date('2026-08-02T08:00:00.000Z') } },
        ],
        _count: { bookings: 2 },
      },
    ]);
    const service = new CoachesPanelClientsService({
      coachProfile: { findUnique },
      user: { findMany },
    } as never);

    const page = await service.listForUser('user-1');

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          bookings: { some: { session: { coachId: 'coach-1' } } },
        },
      }),
    );
    expect(page.items).toEqual([
      {
        id: 'client-1',
        name: 'Anna',
        lastName: 'Lee',
        bookingCount: 2,
        lastSessionAt: '2026-08-02T08:00:00.000Z',
      },
    ]);
  });

  it('hides a client who never booked this coach', async () => {
    const count = jest.fn().mockResolvedValue(0);
    const findMany = jest.fn();
    const service = new CoachesPanelClientsService({
      coachProfile: {
        findUnique: jest.fn().mockResolvedValue({ id: 'coach-1' }),
      },
      booking: { count, findMany },
    } as never);

    await expect(
      service.listBookingsForUser('user-1', 'other-client', 5, 0),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(count).toHaveBeenCalledWith({
      where: {
        userId: 'other-client',
        user: { deletedAt: null },
        session: { coachId: 'coach-1' },
      },
    });
    expect(findMany).not.toHaveBeenCalled();
  });

  it('returns this coach bookings newest class first', async () => {
    const findMany = jest
      .fn()
      .mockResolvedValue([
        bookingRow('older', '2026-07-01T08:00:00.000Z'),
        bookingRow('newer', '2026-08-01T08:00:00.000Z'),
      ]);
    const service = new CoachesPanelClientsService({
      coachProfile: {
        findUnique: jest.fn().mockResolvedValue({ id: 'coach-1' }),
      },
      booking: { count: jest.fn().mockResolvedValue(2), findMany },
    } as never);

    const page = await service.listBookingsForUser('user-1', 'client-1', 1, 0);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 'client-1',
          user: { deletedAt: null },
          session: { coachId: 'coach-1' },
        },
      }),
    );
    expect(page.total).toBe(2);
    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.id).toBe('newer');
  });
});

function bookingRow(id: string, startsAt: string) {
  return {
    id,
    status: 'BOOKED',
    channel: 'WEBSITE',
    attendedAt: null,
    cancelledAt: null,
    createdAt: new Date('2026-06-01T08:00:00.000Z'),
    guestName: null,
    guestPassSlot: 0,
    session: {
      startsAt: new Date(startsAt),
      level: null,
      classType: { name: 'Reformer' },
      coach: { user: { name: 'Ana', lastName: 'Coach' } },
    },
  };
}
