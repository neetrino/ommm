import {
  BookingStatus,
  ManualPaymentMethod,
  PaymentStatus,
  Prisma,
  Role,
  type User,
} from '@prisma/client';
import { buildStudioDateTimeFilter } from '../common/studio-date-range';

/** Inclusive studio-day bounds. A lone `from` is that single calendar day. */
export function buildSessionStartsAtFilter(
  from?: string,
  to?: string,
): Prisma.DateTimeFilter | undefined {
  return buildStudioDateTimeFilter(from, to);
}

export function buildScopedSessionFilter(params: {
  actor: User;
  from?: string;
  to?: string;
  classTypeId?: string;
  coachId?: string;
}): Prisma.ClassSessionWhereInput | undefined {
  const coachScope =
    params.actor.role === Role.COACH
      ? ({
          coach: { userId: params.actor.id },
        } as Prisma.ClassSessionWhereInput)
      : undefined;
  const startsAt = buildSessionStartsAtFilter(params.from, params.to);

  const filter: Prisma.ClassSessionWhereInput = {
    ...(startsAt ? { startsAt } : {}),
    ...(params.classTypeId ? { classTypeId: params.classTypeId } : {}),
    ...(params.coachId ? { coachId: params.coachId } : {}),
    ...(coachScope ?? {}),
  };
  return Object.keys(filter).length > 0 ? filter : undefined;
}

export function resolveAttendanceStatus(status: BookingStatus) {
  if (status === BookingStatus.COMPLETED) {
    return 'ATTENDED';
  }
  if (status === BookingStatus.MISSED) {
    return 'NO_SHOW';
  }
  if (status === BookingStatus.CANCELLED) {
    return 'NOT_ATTENDED';
  }
  return 'NOT_ATTENDED';
}

export function resolvePaymentStatus(params: {
  booking: {
    sessionId: string;
    status: BookingStatus;
  };
  payments: Array<{
    status: PaymentStatus;
    description: string | null;
  }>;
}) {
  if (params.booking.status === BookingStatus.CANCELLED) {
    return 'CANCELLED';
  }

  const sessionPayment = params.payments.find((payment) =>
    (payment.description ?? '').includes(params.booking.sessionId),
  );
  if (sessionPayment?.status === PaymentStatus.REFUNDED) {
    return 'CANCELLED';
  }
  if (
    sessionPayment?.status === PaymentStatus.SUCCEEDED &&
    /cash/i.test(sessionPayment.description ?? '')
  ) {
    return 'CASH';
  }
  if (sessionPayment?.status === PaymentStatus.SUCCEEDED) {
    return 'PAID';
  }
  return 'UNPAID';
}

export function resolveBookingPaymentMethod(params: {
  booking: {
    sessionId: string;
  };
  payments: Array<{
    paymentMethod: ManualPaymentMethod | null;
    description: string | null;
  }>;
}): ManualPaymentMethod | null {
  const dropInDescription = `Drop-in session ${params.booking.sessionId}`;
  const sessionPayment = params.payments.find(
    (payment) => (payment.description ?? '') === dropInDescription,
  );
  if (sessionPayment?.paymentMethod) {
    return sessionPayment.paymentMethod;
  }

  return null;
}
