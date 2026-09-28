import { BadRequestException } from '@nestjs/common';
import { GiftCardStatus, GiftCardTransactionKind, GiftCardType, Prisma } from '@prisma/client';
import {
  claimPreissuedGiftCard,
  generateGiftCardCode,
  resolveIssuedExpiresAt,
} from '../gift-cards/gift-card-issue';
import { formatCustomerDisplayName } from './payment-email-format.util';
import type { GiftCardBatchSnapshot, PaymentMetadata } from './payments.types';

export type IssuedGiftCard = {
  code: string;
  recipientEmail?: string;
  recipientName?: string;
  amountAmd: number;
  message?: string;
};

const GIFT_BATCH_SELECT = {
  id: true,
  amountAmd: true,
  imageUrl: true,
  expiresAt: true,
  message: true,
  recipientName: true,
  recipientEmail: true,
  availableQuantity: true,
  status: true,
} as const;

export async function loadSelectedGiftBatch(
  tx: Prisma.TransactionClient,
  batchId: string | null,
): Promise<GiftCardBatchSnapshot | null> {
  if (!batchId) {
    return null;
  }
  const decremented = await tx.giftCardBatch.updateMany({
    where: {
      id: batchId,
      status: GiftCardStatus.ACTIVE,
      availableQuantity: { gt: 0 },
    },
    data: { availableQuantity: { decrement: 1 } },
  });
  if (decremented.count !== 1) {
    throw new BadRequestException('Gift card is out of stock');
  }
  const selectedBatch = await tx.giftCardBatch.findUnique({
    where: { id: batchId },
    select: GIFT_BATCH_SELECT,
  });
  if (!selectedBatch) {
    throw new BadRequestException('Gift-card batch not found');
  }
  return selectedBatch;
}

export async function issuePurchasedGiftCard(
  tx: Prisma.TransactionClient,
  params: {
    purchaserId: string;
    amountCents: number;
    sourceId: string | null;
    metadata: PaymentMetadata;
  },
): Promise<IssuedGiftCard> {
  const selectedBatch = await loadSelectedGiftBatch(tx, params.sourceId);
  const recipientEmail = firstText(
    params.metadata.recipientEmail,
    selectedBatch?.recipientEmail,
  );
  const recipientName = firstText(
    params.metadata.recipientName,
    selectedBatch?.recipientName,
  );
  const message = firstText(params.metadata.message, selectedBatch?.message);
  const amountAmd = selectedBatch?.amountAmd ?? params.amountCents;
  const expiresAt = resolveIssuedExpiresAt(selectedBatch?.expiresAt);
  if (selectedBatch) {
    const claimed = await claimPreissuedGiftCard(tx, {
      batchId: selectedBatch.id,
      purchaserId: params.purchaserId,
      recipientEmail,
      recipientName,
      message,
    });
    if (claimed) {
      return { code: claimed.code, recipientEmail, recipientName, amountAmd, message };
    }
  }
  const code = generateGiftCardCode();
  const classGift = readClassGift(params.metadata);
  const created = await tx.giftCard.create({
    data: {
      batchId: selectedBatch?.id,
      code,
      type: classGift === null ? GiftCardType.FIXED_VALUE : GiftCardType.FIXED_CLASS,
      amountAmd: classGift === null ? amountAmd : 0,
      balanceAmd: classGift === null ? amountAmd : 0,
      classTypeId: classGift?.classTypeId,
      classQuantity: classGift?.classQuantity ?? 0,
      balanceClasses: classGift?.classQuantity ?? 0,
      imageUrl: selectedBatch?.imageUrl ?? undefined,
      status: GiftCardStatus.ACTIVE,
      purchaserId: params.purchaserId,
      recipientName,
      recipientEmail,
      message,
      expiresAt,
    },
    select: { id: true },
  });
  await tx.giftCardTransaction.create({
    data: {
      giftCardId: created.id,
      kind: GiftCardTransactionKind.ISSUE,
      amountAmd: classGift === null ? amountAmd : 0,
      classes: classGift?.classQuantity ?? 0,
      balanceAmdAfter: classGift === null ? amountAmd : 0,
      balanceClassesAfter: classGift?.classQuantity ?? 0,
    },
  });
  return { code, recipientEmail, recipientName, amountAmd, message };
}

function readClassGift(
  metadata: PaymentMetadata,
): { classTypeId: string; classQuantity: number } | null {
  if (metadata.giftType !== GiftCardType.FIXED_CLASS) {
    return null;
  }
  if (!metadata.classTypeId || !metadata.classQuantity) {
    throw new BadRequestException('Class gift cards need a class type and quantity');
  }
  return { classTypeId: metadata.classTypeId, classQuantity: metadata.classQuantity };
}

export async function readGiftSenderName(
  tx: Prisma.TransactionClient,
  purchaserId: string,
): Promise<string | undefined> {
  const purchaser = await tx.user.findUnique({
    where: { id: purchaserId },
    select: { name: true, lastName: true },
  });
  if (!purchaser) {
    return undefined;
  }
  const name = formatCustomerDisplayName(purchaser);
  return name.length > 0 ? name : undefined;
}

function firstText(
  ...values: Array<string | null | undefined>
): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return undefined;
}
