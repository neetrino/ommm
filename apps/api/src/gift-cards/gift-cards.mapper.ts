import { BadRequestException } from '@nestjs/common';
import { GiftCardStatus } from '@prisma/client';

export type GiftCardBatchDelegateLike = {
  findMany: (args: {
    where?: Record<string, unknown>;
    include?: Record<string, unknown>;
    orderBy?: Record<string, 'asc' | 'desc'>;
    take?: number;
    skip?: number;
  }) => Promise<Array<Record<string, unknown>>>;
  count: (args: { where?: Record<string, unknown> }) => Promise<number>;
  findUnique: (args: {
    where: { id: string };
    select?: Record<string, boolean>;
  }) => Promise<Record<string, unknown> | null>;
  create: (args: {
    data: Record<string, unknown>;
  }) => Promise<Record<string, unknown>>;
  update: (args: {
    where: { id: string };
    data: Record<string, unknown>;
  }) => Promise<Record<string, unknown>>;
  updateMany: (args: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }) => Promise<{ count: number }>;
  delete: (args: { where: { id: string } }) => Promise<Record<string, unknown>>;
};

export type AdminBoardBatchRow = {
  id: string;
  amountAmd: number;
  imageUrl: string | null;
  status: GiftCardStatus;
  totalQuantity: number;
  availableQuantity: number;
  recipientEmail: string | null;
  recipientName: string | null;
  message: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  purchaser: { email: string; name: string | null } | null;
  recipient: { email: string; name: string | null } | null;
};

export type GiftCardBatchSnapshot = {
  id: string;
  amountAmd?: number;
  amountCents?: number;
  imageUrl: string | null;
  status: GiftCardStatus;
  totalQuantity: number;
  availableQuantity: number;
  purchaserId: string | null;
  recipientId: string | null;
  recipientEmail: string | null;
  recipientName: string | null;
  message: string | null;
  expiresAt: Date | null;
  createdAt: Date;
};

export function giftCardBatchDelegate(
  client: unknown,
): GiftCardBatchDelegateLike {
  return (client as { giftCardBatch: GiftCardBatchDelegateLike }).giftCardBatch;
}

export function readGiftCardAmount(card: unknown): number {
  const row = card as Record<string, unknown>;
  const amountAmd = row.amountAmd;
  if (typeof amountAmd === 'number') {
    return amountAmd;
  }
  const amountCents = row.amountCents;
  return typeof amountCents === 'number' ? amountCents : 0;
}

export function readGiftCardBalance(card: unknown): number {
  const row = card as Record<string, unknown>;
  const balanceAmd = row.balanceAmd;
  if (typeof balanceAmd === 'number') {
    return balanceAmd;
  }
  const balanceCents = row.balanceCents;
  return typeof balanceCents === 'number' ? balanceCents : 0;
}

export function readGiftCardImage(card: unknown): string | null {
  const imageUrl = (card as Record<string, unknown>).imageUrl;
  return typeof imageUrl === 'string' ? imageUrl : null;
}

export function readBatchAmount(batch: unknown): number {
  const row = batch as Record<string, unknown>;
  const amountAmd = row.amountAmd;
  if (typeof amountAmd === 'number') {
    return amountAmd;
  }
  const amountCents = row.amountCents;
  return typeof amountCents === 'number' ? amountCents : 0;
}

export function serializeUserGiftCard(card: {
  id: string;
  code: string;
  status: GiftCardStatus;
  recipientEmail: string | null;
  recipientName: string | null;
  message: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  batch?: { imageUrl: string | null } | null;
}) {
  return {
    id: card.id,
    code: card.code,
    amountCents: readGiftCardAmount(card),
    balanceCents: readGiftCardBalance(card),
    status: card.status,
    imageUrl: readGiftCardImage(card) ?? card.batch?.imageUrl ?? null,
    recipientEmail: card.recipientEmail,
    recipientName: card.recipientName,
    message: card.message,
    expiresAt: card.expiresAt,
    createdAt: card.createdAt,
  };
}

export function serializeAdminBoardBatch(batch: AdminBoardBatchRow) {
  return {
    ...batch,
    amountAmd: readBatchAmount(batch),
    amountCents: readBatchAmount(batch),
  };
}

export function resolveBatchQuantityUpdate(
  existing: Pick<GiftCardBatchSnapshot, 'totalQuantity' | 'availableQuantity'>,
  nextQuantity: number,
): Pick<GiftCardBatchSnapshot, 'totalQuantity' | 'availableQuantity'> | null {
  if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
    throw new BadRequestException('quantity must be a positive integer');
  }
  if (nextQuantity === existing.totalQuantity) {
    return null;
  }
  const issuedCount = existing.totalQuantity - existing.availableQuantity;
  if (nextQuantity < issuedCount) {
    throw new BadRequestException(
      `quantity cannot be less than the number of issued cards (${issuedCount})`,
    );
  }
  return {
    totalQuantity: nextQuantity,
    availableQuantity: nextQuantity - issuedCount,
  };
}
