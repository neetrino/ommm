import { BadRequestException } from '@nestjs/common';
import { GiftCardStatus, GiftCardTransactionKind, GiftCardType } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { defaultGiftCardExpiresAt } from './gift-card-policy';

/** 4 bytes → 8 hex characters. Short enough for the card corner, still unique. */
const GIFT_CODE_BYTES = 4;
const CLAIM_ATTEMPTS = 3;

export type MintGiftCardInput = {
  batchId: string;
  quantity: number;
  amountAmd: number;
  balanceClasses: number;
  classQuantity: number;
  classTypeId: string | null;
  type: GiftCardType;
  imageUrl: string | null;
  message: string | null;
  recipientEmail: string | null;
  recipientName: string | null;
  expiresAt: Date;
};

export function resolveAdminGiftShape(input: {
  type?: string;
  amountAmd?: number;
  classTypeId?: string;
  classQuantity?: number;
}): {
  type: GiftCardType;
  amountAmd: number;
  classTypeId: string | null;
  classQuantity: number;
  balanceClasses: number;
} {
  if (input.type === GiftCardType.FIXED_CLASS) {
    if (!input.classTypeId || !input.classQuantity || input.classQuantity < 1) {
      throw new BadRequestException('Class gift cards need a class type and quantity');
    }
    return {
      type: GiftCardType.FIXED_CLASS,
      amountAmd: input.amountAmd ?? 0,
      classTypeId: input.classTypeId,
      classQuantity: input.classQuantity,
      balanceClasses: input.classQuantity,
    };
  }
  if (input.amountAmd === undefined || input.amountAmd < 1) {
    throw new BadRequestException('amountAmd is required');
  }
  return {
    type: GiftCardType.FIXED_VALUE,
    amountAmd: input.amountAmd,
    classTypeId: null,
    classQuantity: 0,
    balanceClasses: 0,
  };
}

export function generateGiftCardCode(): string {
  return randomBytes(GIFT_CODE_BYTES).toString('hex').toUpperCase();
}

export function resolveIssuedExpiresAt(
  explicit: Date | null | undefined,
  from = new Date(),
  validityMonths?: number,
): Date {
  if (explicit instanceof Date && !Number.isNaN(explicit.getTime())) {
    return explicit;
  }
  return defaultGiftCardExpiresAt(from, validityMonths);
}

export function buildMintedGiftCardRows(
  input: MintGiftCardInput,
): Prisma.GiftCardCreateManyInput[] {
  return Array.from({ length: input.quantity }, () => ({
    batchId: input.batchId,
    code: generateGiftCardCode(),
    type: input.type,
    amountAmd: input.amountAmd,
    balanceAmd: input.type === GiftCardType.FIXED_CLASS ? 0 : input.amountAmd,
    classTypeId: input.classTypeId,
    classQuantity: input.classQuantity,
    balanceClasses: input.balanceClasses,
    imageUrl: input.imageUrl,
    status: GiftCardStatus.ACTIVE,
    recipientEmail: input.recipientEmail,
    recipientName: input.recipientName,
    message: input.message,
    expiresAt: input.expiresAt,
  }));
}

export function giftCardCsv(rows: Array<{
  code: string;
  status: string;
  balanceAmd: number;
  balanceClasses: number;
  recipientEmail: string | null;
  redeemedAt: Date | null;
  expiresAt: Date | null;
}>): string {
  const header = 'code,status,balanceAmd,balanceClasses,recipientEmail,redeemedAt,expiresAt';
  const lines = rows.map((row) =>
    [
      csvCell(row.code),
      csvCell(row.status),
      String(row.balanceAmd),
      String(row.balanceClasses),
      csvCell(row.recipientEmail ?? ''),
      csvCell(row.redeemedAt?.toISOString() ?? ''),
      csvCell(row.expiresAt?.toISOString() ?? ''),
    ].join(','),
  );
  return [header, ...lines].join('\n');
}

type ClaimDb = Pick<Prisma.TransactionClient, 'giftCard'>;

/** Assigns one pre-minted code to the purchaser without activating it. */
export async function claimPreissuedGiftCard(
  tx: ClaimDb,
  params: {
    batchId: string;
    purchaserId: string;
    recipientEmail?: string;
    recipientName?: string;
    message?: string;
  },
): Promise<{ code: string } | null> {
  for (let attempt = 0; attempt < CLAIM_ATTEMPTS; attempt += 1) {
    const candidate = await tx.giftCard.findFirst({
      where: {
        batchId: params.batchId,
        purchaserId: null,
        recipientId: null,
        status: GiftCardStatus.ACTIVE,
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true, code: true },
    });
    if (candidate === null) {
      return null;
    }
    const claimed = await tx.giftCard.updateMany({
      where: { id: candidate.id, purchaserId: null, recipientId: null },
      data: {
        purchaserId: params.purchaserId,
        recipientEmail: params.recipientEmail,
        recipientName: params.recipientName,
        message: params.message,
      },
    });
    if (claimed.count === 1) {
      return { code: candidate.code };
    }
  }
  return null;
}

export function issueLedgerRows(
  cards: Array<{ id: string; balanceAmd: number; balanceClasses: number }>,
): Prisma.GiftCardTransactionCreateManyInput[] {
  return cards.map((card) => ({
    giftCardId: card.id,
    kind: GiftCardTransactionKind.ISSUE,
    amountAmd: card.balanceAmd,
    classes: card.balanceClasses,
    balanceAmdAfter: card.balanceAmd,
    balanceClassesAfter: card.balanceClasses,
  }));
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
