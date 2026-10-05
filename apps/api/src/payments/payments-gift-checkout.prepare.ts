import { BadRequestException } from '@nestjs/common';
import { GiftCardType } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';
import { assertCustomGiftAmount } from './payments-checkout.helpers';
import { resolveGiftCardPolicy } from '../gift-cards/gift-card-policy';
import {
  giftCheckoutChargeAmd,
  normalizeGiftCardMedium,
  type GiftCardMedium,
} from './gift-card-medium';
import { resolveClassGiftCharge } from './payments-gift-class-charge';
import type { PaymentMetadata } from './payments.types';

export type GiftDeliveryChoice = 'EMAIL' | 'WHATSAPP' | 'PRINT';

export type GiftCheckoutRequest = {
  purchaserId: string;
  batchId?: string;
  amountCents: number;
  recipientId?: string;
  recipientName?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  message?: string;
  giftType?: 'FIXED_VALUE' | 'FIXED_CLASS';
  classTypeId?: string;
  classQuantity?: number;
  packagePlanId?: string;
  delivery?: string;
  format?: string;
  deliverAt?: string;
};

type GiftCheckoutDb = Pick<
  PrismaService,
  | 'user'
  | 'studioSettings'
  | 'classType'
  | 'classSession'
  | 'giftCardBatch'
  | 'packagePlan'
>;

/** Recipient may be a member, a name/email, or nobody. The buyer still receives the code. */
export async function resolveGiftCheckoutRecipient(
  db: Pick<PrismaService, 'user'>,
  params: GiftCheckoutRequest,
): Promise<
  Pick<PaymentMetadata, 'recipientId' | 'recipientName' | 'recipientEmail'>
> {
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
    recipientName:
      displayName.length > 0
        ? displayName
        : blankToUndefined(params.recipientName),
  };
}

export async function prepareGiftCheckout(
  db: GiftCheckoutDb,
  params: GiftCheckoutRequest,
): Promise<{
  amountCents: number;
  metadata: PaymentMetadata;
  description: string;
}> {
  const request = await withBatchClassGift(db, params);
  const recipient = await resolveGiftCheckoutRecipient(db, request);
  const giftType =
    request.giftType === GiftCardType.FIXED_CLASS
      ? GiftCardType.FIXED_CLASS
      : GiftCardType.FIXED_VALUE;
  const classShape =
    giftType === GiftCardType.FIXED_CLASS
      ? await resolveClassGiftCharge(db, request)
      : null;
  if (classShape === null && request.batchId === undefined) {
    await assertStudioGiftAmount(db, request.amountCents);
  }
  return pricedGiftCheckout(request, recipient, giftType, classShape);
}

function pricedGiftCheckout(
  request: GiftCheckoutRequest,
  recipient: Pick<
    PaymentMetadata,
    'recipientId' | 'recipientName' | 'recipientEmail'
  >,
  giftType: GiftCardType,
  classShape: {
    amountCents: number;
    classTypeId: string;
    classQuantity: number;
  } | null,
): {
  amountCents: number;
  metadata: PaymentMetadata;
  description: string;
} {
  const faceAmd = classShape?.amountCents ?? request.amountCents;
  const medium = normalizeGiftCardMedium(request.format);
  const priced = giftCheckoutChargeAmd(faceAmd, medium);
  return {
    amountCents: priced.chargeAmd,
    description: giftCheckoutDescription(
      classShape !== null,
      request.batchId,
      medium,
    ),
    metadata: giftCheckoutMetadata(
      request,
      recipient,
      giftType,
      classShape,
      medium,
      faceAmd,
      priced.feeAmd,
    ),
  };
}

/** A shop batch of class sessions is priced from that class, not from a zero money amount. */
async function withBatchClassGift(
  db: GiftCheckoutDb,
  params: GiftCheckoutRequest,
): Promise<GiftCheckoutRequest> {
  const batchId = params.batchId?.trim() ?? '';
  if (batchId.length === 0) {
    return params;
  }
  const batch = await db.giftCardBatch.findFirst({
    where: { id: batchId },
    select: { type: true, classTypeId: true, classQuantity: true },
  });
  if (batch?.type !== GiftCardType.FIXED_CLASS || !batch.classTypeId) {
    return params;
  }
  return {
    ...params,
    giftType: GiftCardType.FIXED_CLASS,
    classTypeId: batch.classTypeId,
    classQuantity: batch.classQuantity,
  };
}

export function normalizeDelivery(
  value: string | undefined,
): GiftDeliveryChoice {
  if (value === 'WHATSAPP' || value === 'PRINT') {
    return value;
  }
  return 'EMAIL';
}

async function assertStudioGiftAmount(
  db: Pick<PrismaService, 'studioSettings'>,
  amountCents: number,
): Promise<void> {
  const row = await db.studioSettings.findFirst({
    select: {
      giftCardMinAmountAmd: true,
      giftCardValidityMonths: true,
      giftCardDenominationsJson: true,
    },
  });
  assertCustomGiftAmount(amountCents, resolveGiftCardPolicy(row));
}

function giftCheckoutMetadata(
  request: GiftCheckoutRequest,
  recipient: Pick<
    PaymentMetadata,
    'recipientId' | 'recipientName' | 'recipientEmail'
  >,
  giftType: GiftCardType,
  classShape: { classTypeId: string; classQuantity: number } | null,
  medium: GiftCardMedium,
  faceAmd: number,
  feeAmd: number,
): PaymentMetadata {
  return {
    ...recipient,
    ...(blankToUndefined(request.message)
      ? { message: request.message?.trim() }
      : {}),
    giftType,
    format: medium,
    giftFaceAmd: faceAmd,
    ...(feeAmd > 0 ? { physicalFeeAmd: feeAmd } : {}),
    delivery: normalizeDelivery(request.delivery),
    ...(blankToUndefined(request.recipientPhone)
      ? { recipientPhone: request.recipientPhone?.trim() }
      : {}),
    ...(classShape
      ? {
          classTypeId: classShape.classTypeId,
          classQuantity: classShape.classQuantity,
        }
      : {}),
    ...(blankToUndefined(request.deliverAt)
      ? { deliverAt: request.deliverAt?.trim() }
      : {}),
  };
}

function giftCheckoutDescription(
  classGift: boolean,
  batchId: string | undefined,
  medium: GiftCardMedium,
): string {
  const base = classGift ? 'Class gift card' : giftValueDescription(batchId);
  return medium === 'PHYSICAL' ? `${base}, physical card` : base;
}

function giftValueDescription(batchId: string | undefined): string {
  return batchId === undefined
    ? 'Custom gift card'
    : 'Gift card purchase (gift)';
}

function blankToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}
