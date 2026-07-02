import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  BookingStatus,
  ClassSessionStatus,
  GiftCardStatus,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { withInternalPaymentWhereFields } from './payments.helpers';
import {
  INTERNAL_PAYMENT_SOURCE,
  type InternalPaymentRecord,
  type InternalPaymentSource,
} from './payments.types';

type PaymentLookupClient = {
  payment: {
    findFirst: (args: {
      where: Prisma.PaymentWhereInput;
    }) => Promise<InternalPaymentRecord | null>;
  };
};

type GiftBatchSnapshot = {
  amountAmd: number | bigint;
  availableQuantity: number;
  status: GiftCardStatus;
};

type DropInSessionSnapshot = {
  status: ClassSessionStatus;
  startsAt: Date;
  capacity: number;
  priceCents: number;
};

export function assertGiftBatchForCheckout(
  batch: GiftBatchSnapshot | null,
  amountCents: number,
): void {
  if (!batch) {
    throw new BadRequestException('Gift-card batch not found');
  }
  if (batch.status !== GiftCardStatus.ACTIVE || batch.availableQuantity < 1) {
    throw new BadRequestException('Gift card is out of stock');
  }
  if (amountCents !== Number(batch.amountAmd)) {
    throw new BadRequestException('Invalid gift-card amount for selected batch');
  }
}

export function assertDropInSessionForCheckout(
  classSession: DropInSessionSnapshot | null,
  existingBooking: { status: BookingStatus } | null,
  bookedCount: number,
): void {
  if (!classSession) {
    throw new BadRequestException('Session not found');
  }
  if (classSession.status === ClassSessionStatus.CANCELLED) {
    throw new BadRequestException('Session is not available');
  }
  if (classSession.startsAt < new Date()) {
    throw new BadRequestException('Session already started');
  }
  if (existingBooking?.status === BookingStatus.BOOKED) {
    throw new BadRequestException('Already booked');
  }
  if (bookedCount >= classSession.capacity) {
    throw new BadRequestException('Session is full — join waitlist');
  }
  if (classSession.priceCents <= 0) {
    throw new BadRequestException('This session does not require payment');
  }
}

export async function findOwnedPendingPaymentByReference(
  client: PaymentLookupClient,
  userId: string,
  paymentReference: string,
  expectedSource: InternalPaymentSource,
  wrongSourceMessage: string,
): Promise<InternalPaymentRecord> {
  const existing = await client.payment.findFirst({
    where: withInternalPaymentWhereFields({ paymentReference }),
  });
  return assertOwnedPendingPayment(
    existing,
    userId,
    expectedSource,
    wrongSourceMessage,
  );
}

export function assertOwnedPendingPayment(
  existing: InternalPaymentRecord | null,
  userId: string,
  expectedSource: InternalPaymentSource,
  wrongSourceMessage: string,
): InternalPaymentRecord {
  if (!existing || existing.userId !== userId) {
    throw new NotFoundException('Payment not found');
  }
  if (existing.status !== PaymentStatus.PENDING) {
    throw new ConflictException('Only pending payments can be confirmed');
  }
  if (existing.source !== expectedSource) {
    throw new BadRequestException(wrongSourceMessage);
  }
  return existing;
}
