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
  recipientPhone?: string;
  message?: string;
  giftType?: 'FIXED_VALUE' | 'FIXED_CLASS';
  classTypeId?: string;
  classQuantity?: number;
  delivery?: 'EMAIL' | 'WHATSAPP' | 'PRINT';
  /** Printed card or a digital code. Digital is free. */
  format?: 'DIGITAL' | 'PHYSICAL';
  /** Gift value before the physical-card fee. The charged payment can be higher. */
  giftFaceAmd?: number;
  physicalFeeAmd?: number;
  deliverAt?: string;
};

export type GiftEmailPayload = {
  to: string;
  code: string;
  channel?: 'EMAIL' | 'WHATSAPP';
  recipientName?: string;
  senderName?: string;
  senderEmail?: string;
  amountAmd?: number;
  message?: string;
  format?: 'DIGITAL' | 'PHYSICAL';
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
