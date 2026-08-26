import {
  OWNER_BOOKING_GUEST_PASS_SLOT,
  ownerBookingUniqueWhere,
  readGuestPassName,
} from './bookings-guest-pass.constants';

describe('bookings-guest-pass.constants', () => {
  it('keys owner bookings to slot 0', () => {
    expect(ownerBookingUniqueWhere('user-1', 'session-1')).toEqual({
      userId_sessionId_guestPassSlot: {
        userId: 'user-1',
        sessionId: 'session-1',
        guestPassSlot: OWNER_BOOKING_GUEST_PASS_SLOT,
      },
    });
  });

  it('treats blank guest names as absent', () => {
    expect(readGuestPassName('  Ana  ')).toBe('Ana');
    expect(readGuestPassName('   ')).toBeNull();
    expect(readGuestPassName(undefined)).toBeNull();
  });
});
