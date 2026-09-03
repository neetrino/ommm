import {
  BookingStatus,
  ClassSessionStatus,
  type ClassSession,
} from '@prisma/client';

export const RELEASE_SLOT_ERROR = {
  NOT_FOUND: 'Booking not found',
  NOT_CANCELLABLE: 'Cannot cancel this booking',
} as const;

const RELEASABLE_BOOKING_STATUSES: readonly BookingStatus[] = [
  BookingStatus.BOOKED,
  BookingStatus.COMPLETED,
  BookingStatus.MISSED,
];

export type ReleaseSlotSession = Pick<
  ClassSession,
  'priceCents' | 'sessionRequirement'
> &
  Partial<Pick<ClassSession, 'status' | 'endsAt'>>;

export function isReleasableBookingStatus(status: BookingStatus): boolean {
  return RELEASABLE_BOOKING_STATUSES.includes(status);
}

export function shouldOpenSlotAfterRelease(params: {
  previousStatus: BookingStatus;
  sessionStatus?: ClassSessionStatus;
  endsAt?: Date;
  now?: Date;
}): boolean {
  if (
    params.previousStatus === BookingStatus.COMPLETED ||
    params.previousStatus === BookingStatus.MISSED
  ) {
    return false;
  }
  if (
    params.sessionStatus === ClassSessionStatus.FINISHED ||
    params.sessionStatus === ClassSessionStatus.CANCELLED
  ) {
    return false;
  }
  if (params.endsAt === undefined) {
    return true;
  }
  const now = params.now ?? new Date();
  return params.endsAt.getTime() > now.getTime();
}
