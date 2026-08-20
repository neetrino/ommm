import type { GiftCardStatus, PaymentStatus, Prisma } from '@prisma/client';

export type PaymentListSource = 'package' | 'dropin' | 'gift' | 'other';

export const INTERNAL_PAYMENT_SOURCE = {
  PACKAGE: 'PACKAGE',
  DROPIN: 'DROPIN',
  GIFT: 'GIFT',
  OTHER: 'OTHER',
} as const;

export type InternalPaymentSource =
  (typeof INTERNAL_PAYMENT_SOURCE)[keyof typeof INTERNAL_PAYMENT_SOURCE];

export type PaymentMetadata = {
  recipientId?: string;
  recipientName?: string;
  recipientEmail?: string;
  message?: string;
};

export type GiftEmailPayload = {
  to: string;
  code: string;
};

export type GiftCardBatchSnapshot = {
  id: string;
  amountAmd: number;
  imageUrl: string | null;
  expiresAt: Date | null;
  message: string | null;
  recipientName: string | null;
  recipientEmail: string | null;
  availableQuantity: number;
  status: GiftCardStatus;
};

export type InternalPaymentRecord = {
  id: string;
  userId: string;
  amountCents: number;
  status: PaymentStatus;
  source?: InternalPaymentSource;
  sourceId?: string | null;
  metadata?: Prisma.JsonValue | null;
};
