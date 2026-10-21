import { NotFoundException } from '@nestjs/common';
import { CoachesPanelClientsService } from './coaches-panel-clients.service';

describe('CoachesPanelClientsService', () => {
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
