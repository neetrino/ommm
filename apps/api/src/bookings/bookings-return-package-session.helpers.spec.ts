import {
  canReturnPackageSession,
  hasReturnablePackageSession,
} from './bookings-return-package-session.helpers';

const NOW = new Date('2026-10-12T12:00:00.000Z');
const PAST = new Date('2026-10-12T06:00:00.000Z');
const FUTURE = new Date('2026-10-14T07:00:00.000Z');

const HELD_SESSION = {
  restoredAt: null,
  consumedSessions: 1,
  consumedGuestSlots: 0,
};

describe('bookings-return-package-session.helpers', () => {
  it('treats an open session or guest-pass charge as returnable', () => {
    expect(hasReturnablePackageSession([HELD_SESSION])).toBe(true);
    expect(
      hasReturnablePackageSession([
        { restoredAt: null, consumedSessions: 0, consumedGuestSlots: 1 },
      ]),
    ).toBe(true);
  });

  it('ignores restored charges and unlimited holds', () => {
    expect(
      hasReturnablePackageSession([
        { restoredAt: NOW, consumedSessions: 1, consumedGuestSlots: 0 },
        { restoredAt: null, consumedSessions: 0, consumedGuestSlots: 0 },
      ]),
    ).toBe(false);
  });

  it('allows a finished class while the package charge is still open', () => {
    expect(
      canReturnPackageSession({
        sessionEndsAt: PAST,
        now: NOW,
        consumptions: [HELD_SESSION],
      }),
    ).toBe(true);
  });

  it('hides the action before the class has finished', () => {
    expect(
      canReturnPackageSession({
        sessionEndsAt: FUTURE,
        now: NOW,
        consumptions: [HELD_SESSION],
      }),
    ).toBe(false);
  });

  it('hides the action when the package charge was already returned', () => {
    expect(
      canReturnPackageSession({
        sessionEndsAt: PAST,
        now: NOW,
        consumptions: [
          { restoredAt: NOW, consumedSessions: 1, consumedGuestSlots: 0 },
        ],
      }),
    ).toBe(false);
  });
});
