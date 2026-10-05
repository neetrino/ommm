import { BookingStatus } from '@prisma/client';
import { NotificationsBroadcastService } from './notifications-broadcast.service';
import { NotificationsCronService } from './notifications-cron.service';
import { ENABLE_BACKGROUND_REMINDERS_ENV } from './notifications-audit.constants';

/** Armenia has no DST; wall-clock time is UTC+4. */
const YEREVAN_UTC_OFFSET_MS = 4 * 60 * 60 * 1000;

type ReminderQuery = {
  where: { session: { startsAt: { gte: Date; lte: Date } } };
};

function yerevanWallTimeMs(wallTime: string): number {
  return Date.parse(`${wallTime}:00.000Z`) - YEREVAN_UTC_OFFSET_MS;
}

function queryIncludesStart(startsAt: Date, args: ReminderQuery): boolean {
  const { gte, lte } = args.where.session.startsAt;
  const at = startsAt.getTime();
  return at >= gte.getTime() && at <= lte.getTime();
}

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

  function bookingFixture(startsAt = new Date('2026-09-22T15:00:00.000Z')) {
    return {
      id: 'booking-1',
      user: {
        id: 'user-1',
        email: 'member@test.com',
        locale: 'en',
        notificationPrefs: { bookingReminders: true },
      },
      session: {
        startsAt,
        classType: { name: 'Yoga Flow' },
      },
    };
  }

  async function sendForClassAt(
    startsAt: Date,
    wallTime: string,
  ): Promise<{
    mail: { sendEmail: jest.Mock };
    whatsapp: { trySendToUser: jest.Mock };
    loggedHours: number[];
  }> {
    jest.spyOn(Date, 'now').mockReturnValue(yerevanWallTimeMs(wallTime));
    const booking = bookingFixture(startsAt);
    const { cron, prisma, mail, whatsapp } = createCron(true);
    prisma.booking.findMany.mockImplementation((args: ReminderQuery) =>
      queryIncludesStart(startsAt, args) ? [booking] : [],
    );
    await cron.sendClassReminders();
    const loggedHours = prisma.classReminderSendLog.create.mock.calls.map(
      (call: [{ data: { hoursBefore: number } }]) => call[0].data.hoursBefore,
    );
    return { mail, whatsapp, loggedHours };
  }

  it('does not query bookings when the reminders flag is off', async () => {
    const { cron, prisma } = createCron(false);
    await cron.sendClassReminders();
    expect(prisma.booking.findMany).not.toHaveBeenCalled();
  });

  it('queries a trailing 24h and 2h window that ends at the due instant', async () => {
    jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.parse('2026-09-21T15:00:00.000Z'));
    const { cron, prisma } = createCron(true);
    await cron.sendClassReminders();
    expect(prisma.booking.findMany).toHaveBeenCalledTimes(2);
    const windows = prisma.booking.findMany.mock.calls.map(
      ([args]: [
        { where: { session: { startsAt: { gte: Date; lte: Date } } } },
      ]) => ({
        from: args.where.session.startsAt.gte.toISOString(),
        to: args.where.session.startsAt.lte.toISOString(),
        status: BookingStatus.BOOKED,
      }),
    );
    expect(windows).toEqual([
      {
        from: '2026-09-22T14:25:00.000Z',
        to: '2026-09-22T15:00:00.000Z',
        status: BookingStatus.BOOKED,
      },
      {
        from: '2026-09-21T16:25:00.000Z',
        to: '2026-09-21T17:00:00.000Z',
        status: BookingStatus.BOOKED,
      },
    ]);
  });

  it('sends email, whatsapp and logs hoursBefore for a due booking', async () => {
    jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.parse('2026-09-21T15:00:00.000Z'));
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
    jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.parse('2026-09-21T15:00:00.000Z'));
    const { cron, prisma, mail } = createCron(true);
    prisma.booking.findMany
      .mockResolvedValueOnce([bookingFixture()])
      .mockResolvedValueOnce([]);
    prisma.classReminderSendLog.findUnique.mockResolvedValue({
      id: 'existing',
    });
    await cron.sendClassReminders();
    expect(mail.sendEmail).not.toHaveBeenCalled();
    expect(prisma.classReminderSendLog.create).not.toHaveBeenCalled();
  });

  it('sends a 10:00 Yerevan class at 10:00 and 08:00, not 30 minutes early', async () => {
    const startsAt = new Date(yerevanWallTimeMs('2026-10-06T10:00'));
    const earlyDayBefore = await sendForClassAt(startsAt, '2026-10-05T09:30');
    expect(earlyDayBefore.mail.sendEmail).not.toHaveBeenCalled();
    expect(earlyDayBefore.whatsapp.trySendToUser).not.toHaveBeenCalled();

    const dayBefore = await sendForClassAt(startsAt, '2026-10-05T10:00');
    expect(dayBefore.mail.sendEmail).toHaveBeenCalledTimes(1);
    expect(dayBefore.whatsapp.trySendToUser).toHaveBeenCalledTimes(1);
    expect(dayBefore.loggedHours).toEqual([24]);

    const earlySameDay = await sendForClassAt(startsAt, '2026-10-06T07:30');
    expect(earlySameDay.mail.sendEmail).not.toHaveBeenCalled();
    expect(earlySameDay.whatsapp.trySendToUser).not.toHaveBeenCalled();

    const twoHoursBefore = await sendForClassAt(startsAt, '2026-10-06T08:00');
    expect(twoHoursBefore.mail.sendEmail).toHaveBeenCalledTimes(1);
    expect(twoHoursBefore.whatsapp.trySendToUser).toHaveBeenCalledTimes(1);
    expect(twoHoursBefore.loggedHours).toEqual([2]);
  });

  it('still catches a 10:15 class on the next cron tick', async () => {
    const startsAt = new Date(yerevanWallTimeMs('2026-10-06T10:15'));
    const onTheHour = await sendForClassAt(startsAt, '2026-10-05T10:00');
    expect(onTheHour.mail.sendEmail).not.toHaveBeenCalled();

    const halfHour = await sendForClassAt(startsAt, '2026-10-05T10:30');
    expect(halfHour.mail.sendEmail).toHaveBeenCalledTimes(1);
    expect(halfHour.loggedHours).toEqual([24]);
  });
});
