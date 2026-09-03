import { renderGiftCardWhatsapp } from './whatsapp-commerce-templates';
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
        render: () => 'Hi',
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
        render: () => 'Hi',
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
        render: () => 'Hi',
      }),
    ).resolves.toBe('skipped');
    expect(gateway.sendText).not.toHaveBeenCalled();
  });

  it('sends hy and en when phone and prefs allow', async () => {
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
        render: (locale) => (locale === 'hy' ? 'Բարև' : 'Hello'),
      }),
    ).resolves.toBe('sent');
    expect(gateway.sendText).toHaveBeenCalledTimes(2);
    expect(gateway.sendText).toHaveBeenNthCalledWith(
      1,
      '37441881822@c.us',
      'Բարև',
    );
    expect(gateway.sendText).toHaveBeenNthCalledWith(
      2,
      '37441881822@c.us',
      'Hello',
    );
  });

  it('sends bilingual gift card messages', async () => {
    const { service, prisma, gateway } = createService();
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: 'u1' })
      .mockResolvedValueOnce({
        phone: '+37441881822',
        notificationPrefs: {
          whatsappEnabled: true,
          bookingReminders: true,
          waitlistAlerts: true,
          promotions: false,
        },
      });

    await expect(
      service.trySendGiftCard('user@example.com', 'ABC123'),
    ).resolves.toBe('sent');
    expect(gateway.sendText).toHaveBeenCalledTimes(2);
    expect(gateway.sendText).toHaveBeenNthCalledWith(
      1,
      '37441881822@c.us',
      renderGiftCardWhatsapp('hy', { code: 'ABC123' }),
    );
    expect(gateway.sendText).toHaveBeenNthCalledWith(
      2,
      '37441881822@c.us',
      renderGiftCardWhatsapp('en', { code: 'ABC123' }),
    );
  });
});
