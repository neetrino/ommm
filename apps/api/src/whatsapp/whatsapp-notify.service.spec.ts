import { WhatsappNotifyService } from './whatsapp-notify.service';

describe('WhatsappNotifyService', () => {
  function createService() {
    const prisma = {
      user: { findUnique: jest.fn() },
    };
    const gateway = {
      isConfigured: jest.fn().mockResolvedValue(true),
      sendText: jest.fn().mockResolvedValue(true),
    };
    return {
      service: new WhatsappNotifyService(prisma as never, gateway as never),
      prisma,
      gateway,
    };
  }

  it('returns failed when credentials lookup throws', async () => {
    const { service, gateway } = createService();
    gateway.isConfigured.mockRejectedValue(new Error('db down'));

    await expect(
      service.trySendToUser({
        userId: 'u1',
        topic: 'operational',
        text: 'Hi',
      }),
    ).resolves.toBe('failed');
  });

  it('skips when Gateway env is missing', async () => {
    const { service, gateway, prisma } = createService();
    gateway.isConfigured.mockResolvedValue(false);

    await expect(
      service.trySendToUser({
        userId: 'u1',
        topic: 'operational',
        text: 'Hi',
      }),
    ).resolves.toBe('skipped');
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('skips when WhatsApp prefs are off', async () => {
    const { service, prisma, gateway } = createService();
    prisma.user.findUnique.mockResolvedValue({
      phone: '+37441881822',
      notificationPrefs: {
        whatsappEnabled: false,
        bookingReminders: true,
        waitlistAlerts: true,
        promotions: false,
      },
    });

    await expect(
      service.trySendToUser({
        userId: 'u1',
        topic: 'bookingReminders',
        text: 'Hi',
      }),
    ).resolves.toBe('skipped');
    expect(gateway.sendText).not.toHaveBeenCalled();
  });

  it('sends when phone and prefs allow', async () => {
    const { service, prisma, gateway } = createService();
    prisma.user.findUnique.mockResolvedValue({
      phone: '+37441881822',
      notificationPrefs: {
        whatsappEnabled: true,
        bookingReminders: true,
        waitlistAlerts: true,
        promotions: false,
      },
    });

    await expect(
      service.trySendToUser({
        userId: 'u1',
        topic: 'bookingReminders',
        text: 'Hi',
      }),
    ).resolves.toBe('sent');
    expect(gateway.sendText).toHaveBeenCalledWith('37441881822@c.us', 'Hi');
  });
});
