import { BookingStatus, UserPackageStatus } from '@prisma/client';
import {
  isStaffCancellableBookingStatus,
  isUserPackagePeriodOpen,
  packagesAllowStaffCancel,
  requiresOpenPackagePeriod,
  shouldReopenSessionCapacity,
  STAFF_CANCELLABLE_BOOKING_STATUSES,
} from './bookings-staff-cancel.helpers';

describe('bookings-staff-cancel.helpers', () => {
  const now = new Date('2026-09-02T12:00:00.000Z');

  it('allows staff cancel for booked, completed, and missed only', () => {
    expect(isStaffCancellableBookingStatus(BookingStatus.BOOKED)).toBe(true);
    expect(isStaffCancellableBookingStatus(BookingStatus.COMPLETED)).toBe(true);
    expect(isStaffCancellableBookingStatus(BookingStatus.MISSED)).toBe(true);
    expect(isStaffCancellableBookingStatus(BookingStatus.CANCELLED)).toBe(false);
    expect(STAFF_CANCELLABLE_BOOKING_STATUSES).toHaveLength(3);
  });

  it('requires an open package period only after the class outcome', () => {
    expect(requiresOpenPackagePeriod(BookingStatus.BOOKED)).toBe(false);
    expect(requiresOpenPackagePeriod(BookingStatus.COMPLETED)).toBe(true);
    expect(requiresOpenPackagePeriod(BookingStatus.MISSED)).toBe(true);
    expect(requiresOpenPackagePeriod(BookingStatus.CANCELLED)).toBe(false);
  });

  it('treats a package as open through currentPeriodEnd', () => {
    expect(
      isUserPackagePeriodOpen(
        {
          currentPeriodEnd: now,
          status: UserPackageStatus.ACTIVE,
        },
        now,
      ),
    ).toBe(true);
    expect(
      isUserPackagePeriodOpen(
        {
          currentPeriodEnd: new Date('2026-09-12T12:00:00.000Z'),
          status: UserPackageStatus.PAUSED,
        },
        now,
      ),
    ).toBe(true);
  });

  it('rejects expired or ended packages', () => {
    expect(
      isUserPackagePeriodOpen(
        {
          currentPeriodEnd: new Date('2026-08-20T12:00:00.000Z'),
          status: UserPackageStatus.ACTIVE,
        },
        now,
      ),
    ).toBe(false);
    expect(
      isUserPackagePeriodOpen(
        {
          currentPeriodEnd: new Date('2026-12-01T00:00:00.000Z'),
          status: UserPackageStatus.EXPIRED,
        },
        now,
      ),
    ).toBe(false);
    expect(
      isUserPackagePeriodOpen(
        {
          currentPeriodEnd: new Date('2026-12-01T00:00:00.000Z'),
          status: UserPackageStatus.CANCELLED,
        },
        now,
      ),
    ).toBe(false);
  });

  it('reopens capacity only for upcoming booked seats', () => {
    const endsAt = new Date('2026-09-04T19:00:00.000Z');
    expect(
      shouldReopenSessionCapacity(BookingStatus.BOOKED, endsAt, now),
    ).toBe(true);
    expect(
      shouldReopenSessionCapacity(
        BookingStatus.BOOKED,
        new Date('2026-08-20T19:00:00.000Z'),
        now,
      ),
    ).toBe(false);
    expect(
      shouldReopenSessionCapacity(BookingStatus.COMPLETED, endsAt, now),
    ).toBe(false);
    expect(
      shouldReopenSessionCapacity(BookingStatus.MISSED, endsAt, now),
    ).toBe(false);
  });

  it('allows restore when every consumed package is still open', () => {
    expect(packagesAllowStaffCancel([], now)).toBe(true);
    expect(
      packagesAllowStaffCancel(
        [
          {
            currentPeriodEnd: new Date('2026-09-20T00:00:00.000Z'),
            status: UserPackageStatus.ACTIVE,
          },
        ],
        now,
      ),
    ).toBe(true);
    expect(
      packagesAllowStaffCancel(
        [
          {
            currentPeriodEnd: new Date('2026-08-01T00:00:00.000Z'),
            status: UserPackageStatus.ACTIVE,
          },
        ],
        now,
      ),
    ).toBe(false);
  });
});
