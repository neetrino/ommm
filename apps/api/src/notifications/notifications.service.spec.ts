import { NotificationsService } from './notifications.service';
import { BroadcastAudience } from './dto/broadcast.dto';

describe('NotificationsService', () => {
  function createService() {
    const prisma = {
      auditLog: {
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'log-1' }),
      },
      user: {
        findMany: jest.fn().mockResolvedValue([
          { email: 'u1@test.com' },
          { email: 'u2@test.com' },
        ]),
      },
      classReminderSendLog: {
        findUnique: jest.fn(),
        create: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      booking: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    const mail = { sendEmail: jest.fn().mockResolvedValue(undefined) };
    const expoPush = { send: jest.fn().mockResolvedValue(undefined) };
    const audit = { log: jest.fn().mockResolvedValue(undefined) };
    return {
      service: new NotificationsService(
        prisma as never,
        mail as never,
        expoPush as never,
        audit as never,
      ),
      prisma,
      mail,
      audit,
    };
  }

  it('broadcastToAll targets selected audience with promotions filter', async () => {
    const { service, prisma, audit } = createService();

    const result = await service.broadcastToAll('Promo', '<p>Hi</p>', {
      audience: BroadcastAudience.USERS,
      onlyPromotionsOptIn: true,
    });

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          role: { in: ['USER'] },
          notificationPrefs: { is: { promotions: true } },
        }),
      }),
    );
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'NOTIFICATION_BROADCAST',
        payload: expect.objectContaining({
          audience: BroadcastAudience.USERS,
          onlyPromotionsOptIn: true,
        }),
      }),
    );
    expect(result.count).toBe(2);
  });

  it('broadcastToAll sends test email without querying audience', async () => {
    const { service, prisma, mail } = createService();

    const result = await service.broadcastToAll('Test', '<p>Body</p>', {
      testTo: 'test@example.com',
      audience: BroadcastAudience.ALL,
      onlyPromotionsOptIn: false,
    });

    expect(mail.sendEmail).toHaveBeenCalledWith({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Body</p>',
    });
    expect(prisma.user.findMany).not.toHaveBeenCalled();
    expect(result.mode).toBe('test');
  });

  it('scheduleBroadcast queues future notification broadcast', async () => {
    const { service, audit } = createService();
    const scheduleAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const result = await service.scheduleBroadcast('admin-1', {
      subject: 'Future',
      html: '<p>Later</p>',
      audience: BroadcastAudience.ALL,
      onlyPromotionsOptIn: false,
      scheduleAt,
    });

    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'NOTIFICATION_BROADCAST_SCHEDULED',
        payload: expect.objectContaining({ scheduleAt }),
      }),
    );
    expect(result.mode).toBe('scheduled');
  });

  it('getAdminStats aggregates queue and delivery counters', async () => {
    const { service, prisma } = createService();
    prisma.auditLog.count
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(9);
    prisma.classReminderSendLog.count.mockResolvedValue(12);

    const stats = await service.getAdminStats();

    expect(stats.scheduledBroadcasts).toBe(5);
    expect(stats.scheduledSent).toBe(3);
    expect(stats.scheduledFailed).toBe(1);
    expect(stats.scheduledPending).toBe(1);
    expect(stats.immediateBroadcasts).toBe(9);
    expect(stats.reminderDeliveries).toBe(12);
  });
});
