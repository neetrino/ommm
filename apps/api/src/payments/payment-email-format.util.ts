import { PaymentSource, PaymentStatus } from '@prisma/client';

const AMD_SYMBOL = '֏';

/** Ommm studio wall-clock for transactional emails (matches Armenia local time). */
export const PAYMENT_EMAIL_TIMEZONE = 'Asia/Yerevan';

/** Formats AMD amounts stored in `amountCents` fields (whole dram units). */
export function formatPaymentAmount(
  amountCents: number,
  currency: string,
): string {
  const normalized = currency.trim().toLowerCase();
  if (normalized === 'amd') {
    const amount = new Intl.NumberFormat('en-US', {
      useGrouping: true,
      maximumFractionDigits: 0,
    }).format(Math.round(amountCents));
    return `${amount} ${AMD_SYMBOL}`;
  }

  const majorUnits = amountCents / 100;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: normalized.toUpperCase(),
    }).format(majorUnits);
  } catch {
    return `${majorUnits.toFixed(2)} ${normalized.toUpperCase()}`;
  }
}

/** Human-readable payment source label for transactional emails. */
export function formatPaymentSourceLabel(source: PaymentSource): string {
  if (source === PaymentSource.PACKAGE) {
    return 'Package purchase';
  }
  if (source === PaymentSource.DROPIN) {
    return 'Drop-in class';
  }
  if (source === PaymentSource.GIFT) {
    return 'Gift card purchase';
  }
  return 'Other';
}

/** Human-readable payment status label for admin emails. */
export function formatPaymentStatusLabel(status: PaymentStatus): string {
  if (status === PaymentStatus.SUCCEEDED) {
    return 'Succeeded';
  }
  if (status === PaymentStatus.PENDING) {
    return 'Pending';
  }
  if (status === PaymentStatus.FAILED) {
    return 'Failed';
  }
  if (status === PaymentStatus.REFUNDED) {
    return 'Refunded';
  }
  return status;
}

/** Short offset label for the studio timezone (e.g. GMT+4). */
export function formatPaymentTimezoneLabel(date: Date): string {
  const part = new Intl.DateTimeFormat('en-GB', {
    timeZone: PAYMENT_EMAIL_TIMEZONE,
    timeZoneName: 'shortOffset',
  })
    .formatToParts(date)
    .find((segment) => segment.type === 'timeZoneName');

  return part?.value ?? 'GMT+4';
}

/** Formats a payment timestamp for email detail rows in studio local time (24h). */
export function formatPaymentDateTime(date: Date): string {
  const formatted = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: PAYMENT_EMAIL_TIMEZONE,
    hour12: false,
  }).format(date);

  return `${formatted} (${formatPaymentTimezoneLabel(date)})`;
}

/** Builds a display name from user profile fields. */
export function formatCustomerDisplayName(params: {
  name: string | null;
  lastName: string | null;
}): string {
  const parts = [params.name?.trim(), params.lastName?.trim()].filter(
    (part): part is string => Boolean(part && part.length > 0),
  );
  return parts.join(' ');
}
