/**
 * Mirrors web `refetchKeysForEvent` mapping (plan §4.5 burst collapse).
 * Kept in API tests because the web app has no Jest setup.
 */
import { REALTIME_EVENT_NAMES } from './realtime.types';

type RefetchKey =
  | 'schedule/public'
  | 'bookings/me'
  | 'waitlist/me'
  | 'packages/me'
  | 'classes/admin/sessions'
  | 'bookings/admin'
  | 'waitlist/admin';

function refetchKeysForEvent(type: string): RefetchKey[] {
  switch (type) {
    case REALTIME_EVENT_NAMES.SCHEDULE_INVALIDATE:
    case REALTIME_EVENT_NAMES.SESSION_CHANGED:
    case REALTIME_EVENT_NAMES.CANCEL_INTENT_CHANGED:
      return ['schedule/public', 'classes/admin/sessions'];
    case REALTIME_EVENT_NAMES.BOOKING_CHANGED:
      return [
        'bookings/me',
        'schedule/public',
        'packages/me',
        'bookings/admin',
        'waitlist/admin',
      ];
    case REALTIME_EVENT_NAMES.WAITLIST_CHANGED:
    case REALTIME_EVENT_NAMES.WAITLIST_OFFER:
      return ['waitlist/me', 'waitlist/admin'];
    default:
      return [];
  }
}

function collapseBurstKeys(events: readonly string[]): RefetchKey[] {
  const keys = events.flatMap((type) => refetchKeysForEvent(type));
  return [...new Set(keys)];
}

describe('realtime refetch key mapping', () => {
  it('collapses booking burst into schedule/public and bookings/me once each', () => {
    const keys = collapseBurstKeys([
      REALTIME_EVENT_NAMES.BOOKING_CHANGED,
      REALTIME_EVENT_NAMES.SCHEDULE_INVALIDATE,
      REALTIME_EVENT_NAMES.SESSION_CHANGED,
    ]);
    expect(keys).toEqual([
      'bookings/me',
      'schedule/public',
      'packages/me',
      'bookings/admin',
      'waitlist/admin',
      'classes/admin/sessions',
    ]);
  });

  it('maps cancel-intent to schedule/public and admin schedule', () => {
    expect(
      refetchKeysForEvent(REALTIME_EVENT_NAMES.CANCEL_INTENT_CHANGED),
    ).toEqual(['schedule/public', 'classes/admin/sessions']);
  });
});
