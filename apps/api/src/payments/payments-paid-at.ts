import { BadRequestException } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import {
  addStudioCalendarDays,
  endOfStudioDayInclusive,
  studioWallClockToUtc,
  utcToStudioCalendarDate,
} from '../common/studio-timezone';
import { isStudioManualPaymentMethod } from './studio-manual-payment.util';

/** How far back an admin may set a cash or terminal paid date. */
export const PAYMENT_PAID_AT_LOOKBACK_DAYS = 730;

const PAID_AT_INVALID = 'Paid date is invalid';
const PAID_AT_TOO_LATE = 'Paid date cannot be in the future';
const PAID_AT_TOO_EARLY = 'Paid date is too far in the past';
const PAID_AT_NOT_SUCCEEDED =
  'Paid date can be set only after the payment succeeds';
const PAID_AT_NOT_STUDIO =
  'Paid date can be set only for cash and terminal payments';

/** Studio cash/terminal payments that are already marked paid. */
export function assertStudioPaidAtEditable(payment: {
  status: PaymentStatus;
  paymentMethod: string | null;
}): void {
  if (payment.status !== PaymentStatus.SUCCEEDED) {
    throw new BadRequestException(PAID_AT_NOT_SUCCEEDED);
  }
  if (!isStudioManualPaymentMethod(payment.paymentMethod)) {
    throw new BadRequestException(PAID_AT_NOT_STUDIO);
  }
}

/**
 * Accepts an ISO instant and clamps it to the studio calendar:
 * not after today, and not older than {@link PAYMENT_PAID_AT_LOOKBACK_DAYS}.
 */
export function resolveStudioPaidAt(paidAtIso: string, now: Date): Date {
  const paidAt = new Date(paidAtIso);
  if (Number.isNaN(paidAt.getTime())) {
    throw new BadRequestException(PAID_AT_INVALID);
  }
  if (paidAt.getTime() > endOfStudioDayInclusive(now).getTime()) {
    throw new BadRequestException(PAID_AT_TOO_LATE);
  }
  const earliestDay = addStudioCalendarDays(
    utcToStudioCalendarDate(now),
    -PAYMENT_PAID_AT_LOOKBACK_DAYS,
  );
  const earliest = studioWallClockToUtc(earliestDay, '00:00');
  if (paidAt.getTime() < earliest.getTime()) {
    throw new BadRequestException(PAID_AT_TOO_EARLY);
  }
  return paidAt;
}
