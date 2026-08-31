import { WaitlistStatus } from '@prisma/client';
import { WaitlistOffersService } from './waitlist-offers.service';

describe('WaitlistOffersService.expireForCancelledSession', () => {
  function buildService() {
    const prisma = {
      waitlistEntry: {
        findMany: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const realtime = { emitWaitlistChanged: jest.fn() };
    const service = new WaitlistOffersService(
      prisma as never,
      {} as never,
      {} as never,
      {} as never,
      realtime as never,
      { trySendToUser: jest.fn() } as never,
    );
    return { service, prisma, realtime };
  }

  it('expires open waitlist rows and notifies those users', async () => {
    const { service, prisma, realtime } = buildService();
    prisma.waitlistEntry.findMany.mockResolvedValue([
      { userId: 'user-a' },
      { userId: 'user-b' },
    ]);

    await service.expireForCancelledSession('session-1');

    expect(prisma.waitlistEntry.updateMany).toHaveBeenCalledWith({
      where: {
        sessionId: 'session-1',
        status: { in: [WaitlistStatus.ACTIVE, WaitlistStatus.OFFERED] },
      },
      data: { status: WaitlistStatus.EXPIRED },
    });
    expect(realtime.emitWaitlistChanged).toHaveBeenCalledTimes(2);
    expect(realtime.emitWaitlistChanged).toHaveBeenCalledWith(
      'user-a',
      'session-1',
    );
  });

  it('does nothing when there are no open waitlist rows', async () => {
    const { service, prisma, realtime } = buildService();
    prisma.waitlistEntry.findMany.mockResolvedValue([]);

    await service.expireForCancelledSession('session-1');

    expect(prisma.waitlistEntry.updateMany).not.toHaveBeenCalled();
    expect(realtime.emitWaitlistChanged).not.toHaveBeenCalled();
  });
});
