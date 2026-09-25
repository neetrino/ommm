import { BadRequestException } from '@nestjs/common';
import { GiftCardStatus, Prisma } from '@prisma/client';
import { randomBytes } from 'node:crypto';
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
  const code = randomBytes(8).toString('hex').toUpperCase();
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
  await tx.giftCard.create({
    data: {
      batchId: selectedBatch?.id,
      code,
      amountAmd,
      balanceAmd: amountAmd,
      imageUrl: selectedBatch?.imageUrl ?? undefined,
      status: GiftCardStatus.ACTIVE,
      purchaserId: params.purchaserId,
      recipientId: firstText(params.metadata.recipientId),
      recipientName,
      recipientEmail,
      message,
      expiresAt: selectedBatch?.expiresAt ?? undefined,
    },
  });
  return { code, recipientEmail, recipientName, amountAmd, message };
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
