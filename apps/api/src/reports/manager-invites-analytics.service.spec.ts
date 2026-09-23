import { ClientRegistrationSource, Role } from '@prisma/client';
import { ManagerInvitesAnalyticsService } from './manager-invites-analytics.service';

describe('ManagerInvitesAnalyticsService', () => {
  it('groups referred clients by manager for the range', async () => {
    const prisma = {
      user: {
        findMany: jest
          .fn()
          .mockResolvedValueOnce([
            {
              id: 'm1',
              name: 'Anna',
              lastName: 'Mgr',
              email: 'anna@example.com',
              isBlocked: false,
            },
            {
              id: 'm2',
              name: 'Bob',
              lastName: null,
              email: 'bob@example.com',
              isBlocked: false,
            },
          ])
          .mockResolvedValueOnce([
            {
              id: 'u1',
              name: 'Client',
              lastName: 'One',
              email: 'c1@example.com',
              createdAt: new Date('2026-09-10T12:00:00.000Z'),
              registeredById: 'm1',
            },
            {
              id: 'u2',
              name: null,
              lastName: null,
              email: 'c2@example.com',
              createdAt: new Date('2026-09-12T12:00:00.000Z'),
              registeredById: 'm1',
            },
          ]),
      },
    };

    const service = new ManagerInvitesAnalyticsService(prisma as never);
    const result = await service.managerInvites({
      from: '2026-09-01T00:00:00.000Z',
      to: '2026-09-30T23:59:59.999Z',
    });

    expect(prisma.user.findMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { role: Role.MANAGER },
      }),
    );
    expect(prisma.user.findMany).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: expect.objectContaining({
          registrationSource: ClientRegistrationSource.INVITE,
          registeredById: { in: ['m1', 'm2'] },
        }),
      }),
    );
    expect(result.totals).toEqual({ managers: 2, referredInRange: 2 });
    expect(result.managers[0]).toMatchObject({
      id: 'm1',
      name: 'Anna Mgr',
      referredCount: 2,
    });
    expect(result.managers[0]?.referredUsers.map((user) => user.name)).toEqual([
      'Client One',
      'c2@example.com',
    ]);
    expect(result.managers[1]).toMatchObject({
      id: 'm2',
      referredCount: 0,
      referredUsers: [],
    });
  });
});
