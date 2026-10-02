import { randomBytes } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { PaymentSourceFilter } from './dto/admin-list-payments-query.dto';
import {
  INTERNAL_PAYMENT_SOURCE,
  type InternalPaymentSource,
  type PaymentListSource,
  type PaymentMetadata,
} from './payments.types';

export function createPaymentReference(prefix: string): string {
  return `${prefix}-${randomBytes(6).toString('hex').toUpperCase()}`;
}

export function withInternalPaymentCreateFields<
  T extends Record<string, unknown>,
>(data: T): Prisma.PaymentUncheckedCreateInput {
  return data as unknown as Prisma.PaymentUncheckedCreateInput;
}

export function withInternalPaymentUpdateFields<
  T extends Record<string, unknown>,
>(data: T): Prisma.PaymentUncheckedUpdateInput {
  return data;
}

export function withInternalPaymentWhereFields<
  T extends Record<string, unknown>,
>(where: T): Prisma.PaymentWhereInput {
  return where;
}

export function isInternalPaymentSource(
  value: unknown,
): value is InternalPaymentSource {
  return (
    value === INTERNAL_PAYMENT_SOURCE.PACKAGE ||
    value === INTERNAL_PAYMENT_SOURCE.DROPIN ||
    value === INTERNAL_PAYMENT_SOURCE.GIFT ||
    value === INTERNAL_PAYMENT_SOURCE.OTHER
  );
}

export function readPaymentSource(
  payment: object,
): InternalPaymentSource | undefined {
  const value = (payment as { source?: unknown }).source;
  return isInternalPaymentSource(value) ? value : undefined;
}

function readString(
  value: object,
  key: keyof PaymentMetadata,
): string | undefined {
  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === 'string' && candidate.trim().length > 0
    ? candidate
    : undefined;
}

export function parsePaymentMetadata(
  value: Prisma.JsonValue | null,
): PaymentMetadata {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }
  return {
    recipientId: readString(value, 'recipientId'),
    recipientName: readString(value, 'recipientName'),
    recipientEmail: readString(value, 'recipientEmail'),
    recipientPhone: readString(value, 'recipientPhone'),
    message: readString(value, 'message'),
    giftType: readGiftType(value),
    classTypeId: readString(value, 'classTypeId'),
    classQuantity: readPositiveInt(value, 'classQuantity'),
    delivery: readDelivery(value),
    deliverAt: readString(value, 'deliverAt'),
  };
}

function readGiftType(value: object): PaymentMetadata['giftType'] {
  const candidate = (value as Record<string, unknown>).giftType;
  return candidate === 'FIXED_CLASS' || candidate === 'FIXED_VALUE'
    ? candidate
    : undefined;
}

function readDelivery(value: object): PaymentMetadata['delivery'] {
  const candidate = (value as Record<string, unknown>).delivery;
  if (
    candidate === 'EMAIL' ||
    candidate === 'WHATSAPP' ||
    candidate === 'PRINT'
  ) {
    return candidate;
  }
  return undefined;
}

function readPositiveInt(
  value: object,
  key: keyof PaymentMetadata,
): number | undefined {
  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === 'number' &&
    Number.isInteger(candidate) &&
    candidate > 0
    ? candidate
    : undefined;
}

function mapPaymentSourceFilter(
  source: PaymentSourceFilter,
): InternalPaymentSource {
  if (source === PaymentSourceFilter.PACKAGE) {
    return INTERNAL_PAYMENT_SOURCE.PACKAGE;
  }
  if (source === PaymentSourceFilter.DROPIN) {
    return INTERNAL_PAYMENT_SOURCE.DROPIN;
  }
  if (source === PaymentSourceFilter.GIFT) {
    return INTERNAL_PAYMENT_SOURCE.GIFT;
  }
  return INTERNAL_PAYMENT_SOURCE.OTHER;
}

export function buildSourceFilter(
  source: PaymentSourceFilter | PaymentSourceFilter[] | undefined,
): Prisma.PaymentWhereInput | undefined {
  const sources = Array.isArray(source) ? source : source ? [source] : [];
  if (sources.length === 0) {
    return undefined;
  }
  const mapped = sources.map(mapPaymentSourceFilter);
  return withInternalPaymentWhereFields({
    source: mapped.length === 1 ? mapped[0] : { in: mapped },
  });
}

export function detectPaymentSource(
  description: string | null,
  source?: InternalPaymentSource,
): PaymentListSource {
  if (source === INTERNAL_PAYMENT_SOURCE.PACKAGE) return 'package';
  if (source === INTERNAL_PAYMENT_SOURCE.DROPIN) return 'dropin';
  if (source === INTERNAL_PAYMENT_SOURCE.GIFT) return 'gift';
  const normalized = (description ?? '').toLowerCase();
  if (normalized.startsWith('membership') || normalized.startsWith('package')) {
    return 'package';
  }
  if (normalized.startsWith('drop-in')) {
    return 'dropin';
  }
  if (normalized.startsWith('gift')) {
    return 'gift';
  }
  return 'other';
}
