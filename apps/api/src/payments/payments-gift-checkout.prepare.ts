import { BadRequestException } from '@nestjs/common';
import { ClassSessionStatus, GiftCardType } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';
import {
  assertCustomGiftAmount,
} from './payments-checkout.helpers';
import { resolveGiftCardPolicy } from '../gift-cards/gift-card-policy';
import type { PaymentMetadata } from './payments.types';

export const CLASS_GIFT_MAX_QUANTITY = 100;

export type GiftDeliveryChoice = 'EMAIL' | 'WHATSAPP' | 'PRINT';

export type GiftCheckoutRequest = {
  purchaserId: string;
  batchId?: string;
  amountCents: number;
  recipientId?: string;
  recipientName?: string;
  recipientEmail?: string;
  message?: string;
  giftType?: 'FIXED_VALUE' | 'FIXED_CLASS';
  classTypeId?: string;
  classQuantity?: number;
  delivery?: string;
  deliverAt?: string;
};

type GiftCheckoutDb = Pick<PrismaService, 'user' | 'studioSettings' | 'classType' | 'classSession'>;

/** Recipient may be a member, a name/email, or nobody. The buyer still receives the code. */
export async function resolveGiftCheckoutRecipient(
  db: Pick<PrismaService, 'user'>,
  params: GiftCheckoutRequest,
): Promise<Pick<PaymentMetadata, 'recipientId' | 'recipientName' | 'recipientEmail'>> {
  const recipientId = params.recipientId?.trim() ?? '';
  if (recipientId.length === 0) {
    return {
      recipientName: blankToUndefined(params.recipientName),
      recipientEmail: blankToUndefined(params.recipientEmail),
    };
  }
  if (recipientId === params.purchaserId) {
    throw new BadRequestException('Cannot gift a card to yourself');
  }
  const recipient = await db.user.findFirst({
    where: { id: recipientId, role: 'USER', isBlocked: false },
    select: { id: true, email: true, name: true, lastName: true },
  });
  if (!recipient) {
    throw new BadRequestException('Gift recipient not found');
  }
  const displayName = [recipient.name, recipient.lastName]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join(' ')
    .trim();
  return {
    recipientId: recipient.id,
    recipientEmail: recipient.email,
    recipientName: displayName.length > 0 ? displayName : blankToUndefined(params.recipientName),
  };
}

export async function prepareGiftCheckout(
  db: GiftCheckoutDb,
  params: GiftCheckoutRequest,
): Promise<{ amountCents: number; metadata: PaymentMetadata; description: string }> {
  const recipient = await resolveGiftCheckoutRecipient(db, params);
  const giftType = params.giftType === GiftCardType.FIXED_CLASS ? GiftCardType.FIXED_CLASS : GiftCardType.FIXED_VALUE;
  const classShape = giftType === GiftCardType.FIXED_CLASS
    ? await resolveClassGiftCharge(db, params)
    : null;
  if (classShape === null && params.batchId === undefined) {
    await assertStudioGiftAmount(db, params.amountCents);
  }
  const amountCents = classShape?.amountCents ?? params.amountCents;
  return {
    amountCents,
    description: classShape === null ? giftValueDescription(params.batchId) : 'Class gift card',
    metadata: {
      ...recipient,
      ...(blankToUndefined(params.message) ? { message: params.message?.trim() } : {}),
      giftType,
      delivery: normalizeDelivery(params.delivery),
      ...(classShape
        ? { classTypeId: classShape.classTypeId, classQuantity: classShape.classQuantity }
        : {}),
      ...(blankToUndefined(params.deliverAt) ? { deliverAt: params.deliverAt?.trim() } : {}),
    },
  };
}

export function normalizeDelivery(value: string | undefined): GiftDeliveryChoice {
  if (value === 'WHATSAPP' || value === 'PRINT') {
    return value;
  }
  return 'EMAIL';
}

async function resolveClassGiftCharge(
  db: GiftCheckoutDb,
  params: GiftCheckoutRequest,
): Promise<{ amountCents: number; classTypeId: string; classQuantity: number }> {
  const classTypeId = params.classTypeId?.trim() ?? '';
  const classQuantity = params.classQuantity ?? 0;
  if (classTypeId.length === 0 || classQuantity < 1 || classQuantity > CLASS_GIFT_MAX_QUANTITY) {
    throw new BadRequestException('Class gift cards need a class type and quantity');
  }
  const unitPriceAmd = await quoteClassUnitPriceAmd(db, classTypeId);
  return { amountCents: unitPriceAmd * classQuantity, classTypeId, classQuantity };
}

/** Latest priced session for this class. Shop price and admin conversion use the same rate. */
export async function quoteClassUnitPriceAmd(
  db: Pick<PrismaService, 'classType' | 'classSession'>,
  classTypeId: string,
): Promise<number> {
  const classType = await db.classType.findFirst({
    where: { id: classTypeId, archivedAt: null },
    select: { id: true },
  });
  if (!classType) {
    throw new BadRequestException('Class type not found');
  }
  const session = await db.classSession.findFirst({
    where: {
      classTypeId,
      priceCents: { gt: 0 },
      status: { not: ClassSessionStatus.CANCELLED },
    },
    orderBy: { startsAt: 'desc' },
    select: { priceCents: true },
  });
  if (!session) {
    throw new BadRequestException('This class has no drop-in price');
  }
  return session.priceCents;
}

async function assertStudioGiftAmount(db: Pick<PrismaService, 'studioSettings'>, amountCents: number): Promise<void> {
  const row = await db.studioSettings.findFirst({
    select: {
      giftCardMinAmountAmd: true,
      giftCardValidityMonths: true,
      giftCardDenominationsJson: true,
    },
  });
  assertCustomGiftAmount(amountCents, resolveGiftCardPolicy(row));
}

function giftValueDescription(batchId: string | undefined): string {
  return batchId === undefined ? 'Custom gift card' : 'Gift card purchase (gift)';
}

function blankToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
