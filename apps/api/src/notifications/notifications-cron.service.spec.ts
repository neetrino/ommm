import { BookingStatus } from '@prisma/client';
import { NotificationsBroadcastService } from './notifications-broadcast.service';
import { NotificationsCronService } from './notifications-cron.service';
import { ENABLE_BACKGROUND_REMINDERS_ENV } from './notifications-audit.constants';

describe('NotificationsCronService', () => {
  const originalFlag = process.env[ENABLE_BACKGROUND_REMINDERS_ENV];

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalFlag === undefined) {
      delete process.env[ENABLE_BACKGROUND_REMINDERS_ENV];
      return;
    }
    process.env[ENABLE_BACKGROUND_REMINDERS_ENV] = originalFlag;
  });

  function createCron(enabled: boolean) {
    process.env[ENABLE_BACKGROUND_REMINDERS_ENV] = enabled ? 'true' : 'false';
    const prisma = {
      booking: { findMany: jest.fn().mockResolvedValue([]) },
      classReminderSendLog: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'log-1' }),
      },
      $queryRaw: jest.fn().mockResolvedValue([]),
      auditLog: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const mail = { sendEmail: jest.fn().mockResolvedValue(undefined) };
    const expoPush = { send: jest.fn().mockResolvedValue(undefined) };
    const audit = { log: jest.fn().mockResolvedValue(undefined) };
    const whatsapp = { trySendToUser: jest.fn().mockResolvedValue('sent') };
    const broadcast = {
      broadcastToAll: jest.fn(),
    } as unknown as NotificationsBroadcastService;
    const cron = new NotificationsCronService(
      prisma as never,
      mail as never,
      expoPush as never,
      audit as never,
      broadcast,
      whatsapp as never,
    );
    return { cron, prisma, mail, expoPush, whatsapp };
  }

  function bookingFixture() {
    return {
      id: 'booking-1',
      user: {
        id: 'user-1',
        email: 'member@test.com',
        locale: 'en',
        notificationPrefs: { bookingReminders: true },
      },
      session: {
        startsAt: new Date('2026-09-22T15:00:00.000Z'),
        classType: { name: 'Yoga Flow' },
      },
    };
  }

  it('does not query bookings when the reminders flag is off', async () => {
    const { cron, prisma } = createCron(false);
    await cron.sendClassReminders();
    expect(prisma.booking.findMany).not.toHaveBeenCalled();
  });

  it('queries both 24h and 2h windows', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-09-21T15:00:00.000Z'));
    const { cron, prisma } = createCron(true);
    await cron.sendClassReminders();
    expect(prisma.booking.findMany).toHaveBeenCalledTimes(2);
    const windows = prisma.booking.findMany.mock.calls.map(
      ([args]: [{ where: { session: { startsAt: { gte: Date; lte: Date } } } }]) => ({
        from: args.where.session.startsAt.gte.toISOString(),
        to: args.where.session.startsAt.lte.toISOString(),
        status: BookingStatus.BOOKED,
      }),
    );
    expect(windows).toEqual([
      {
        from: '2026-09-22T15:00:00.000Z',
        to: '2026-09-22T15:35:00.000Z',
        status: BookingStatus.BOOKED,
      },
      {
        from: '2026-09-21T17:00:00.000Z',
        to: '2026-09-21T17:35:00.000Z',
        status: BookingStatus.BOOKED,
      },
    ]);
  });

  it('sends email, whatsapp and logs hoursBefore for a due booking', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-09-21T15:00:00.000Z'));
    const { cron, prisma, mail, whatsapp } = createCron(true);
    prisma.booking.findMany
      .mockResolvedValueOnce([bookingFixture()])
      .mockResolvedValueOnce([]);
    await cron.sendClassReminders();
    expect(mail.sendEmail).toHaveBeenCalledTimes(1);
    expect(whatsapp.trySendToUser).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        topic: 'bookingReminders',
      }),
    );
    expect(prisma.classReminderSendLog.create).toHaveBeenCalledWith({
      data: { bookingId: 'booking-1', hoursBefore: 24 },
    });
  });

  it('skips a window already logged for that booking', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-09-21T15:00:00.000Z'));
    const { cron, prisma, mail } = createCron(true);
    prisma.booking.findMany
      .mockResolvedValueOnce([bookingFixture()])
      .mockResolvedValueOnce([]);
    prisma.classReminderSendLog.findUnique.mockResolvedValue({ id: 'existing' });
    await cron.sendClassReminders();
    expect(mail.sendEmail).not.toHaveBeenCalled();
    expect(prisma.classReminderSendLog.create).not.toHaveBeenCalled();
  });
});
