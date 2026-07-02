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
    recipientName: readString(value, 'recipientName'),
    recipientEmail: readString(value, 'recipientEmail'),
    message: readString(value, 'message'),
  };
}

export function buildSourceFilter(
  source: PaymentSourceFilter | undefined,
): Prisma.PaymentWhereInput | undefined {
  if (!source) {
    return undefined;
  }
  if (source === PaymentSourceFilter.PACKAGE) {
    return withInternalPaymentWhereFields({
      source: INTERNAL_PAYMENT_SOURCE.PACKAGE,
    });
  }
  if (source === PaymentSourceFilter.DROPIN) {
    return withInternalPaymentWhereFields({
      source: INTERNAL_PAYMENT_SOURCE.DROPIN,
    });
  }
  if (source === PaymentSourceFilter.GIFT) {
    return withInternalPaymentWhereFields({
      source: INTERNAL_PAYMENT_SOURCE.GIFT,
    });
  }
  return withInternalPaymentWhereFields({
    source: INTERNAL_PAYMENT_SOURCE.OTHER,
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
