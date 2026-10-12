import {
  isWithinNotificationSendWindow,
  notificationDueSince,
  notificationDueUntil,
} from './notification-send-window';

/** Armenia has no DST; wall-clock time is UTC+4. */
const YEREVAN_UTC_OFFSET_MS = 4 * 60 * 60 * 1000;

function yerevan(wallTime: string): Date {
  return new Date(Date.parse(`${wallTime}:00.000Z`) - YEREVAN_UTC_OFFSET_MS);
}

describe('notification send window', () => {
  it('is open from 13:00 inclusive until 21:00 exclusive in Yerevan', () => {
    expect(isWithinNotificationSendWindow(yerevan('2026-10-12T12:59'))).toBe(
      false,
    );
    expect(isWithinNotificationSendWindow(yerevan('2026-10-12T13:00'))).toBe(
      true,
    );
    expect(isWithinNotificationSendWindow(yerevan('2026-10-12T20:59'))).toBe(
      true,
    );
    expect(isWithinNotificationSendWindow(yerevan('2026-10-12T21:00'))).toBe(
      false,
    );
    expect(isWithinNotificationSendWindow(yerevan('2026-10-12T03:30'))).toBe(
      false,
    );
  });

  it('rolls quiet hours forward from yesterday 21:00 and stops at the tick', () => {
    const at13 = yerevan('2026-10-12T13:00');
    expect(notificationDueSince(at13).toISOString()).toBe(
      '2026-10-11T17:00:00.000Z',
    );
    expect(notificationDueUntil(at13)?.toISOString()).toBe(
      '2026-10-12T09:00:00.000Z',
    );
    expect(notificationDueUntil(yerevan('2026-10-12T03:30'))).toBeNull();
  });

  it('lets the 20:30 tick cover dues up to 21:00', () => {
    expect(
      notificationDueUntil(yerevan('2026-10-12T20:30'))?.toISOString(),
    ).toBe('2026-10-12T17:00:00.000Z');
    expect(
      notificationDueUntil(yerevan('2026-10-12T20:00'))?.toISOString(),
    ).toBe('2026-10-12T16:00:00.000Z');
  });
});
