import { NotificationsService } from './notifications.service';
import { BroadcastAudience } from './dto/broadcast.dto';

describe('NotificationsService', () => {
  function createService() {
    const prisma = {
      user: {
        findMany: jest.fn().mockResolvedValue([
          { email: 'u1@test.com' },
          { email: 'u2@test.com' },
        ]),
      },
      classReminderSendLog: {
        findUnique: jest.fn(),
        create: jest.fn(),
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
});
