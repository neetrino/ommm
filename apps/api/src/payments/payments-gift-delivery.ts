import { PaymentSource, PaymentStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { mergeArcaMetadata } from './arca/arca-metadata.util';
import type { PrismaService } from '../prisma/prisma.service';
import type { GiftEmailPayload, PaymentMetadata } from './payments.types';

const DUE_GIFT_EMAIL_SCAN = 100;

export type GiftEmailDecision = 'send' | 'schedule' | 'skip';

/** Email goes out now, waits for deliverAt, or is skipped when the buyer chose WhatsApp or print. */
export function decideGiftEmail(input: {
  delivery?: PaymentMetadata['delivery'];
  deliverAt?: string;
  recipientEmail?: string;
  now: Date;
}): GiftEmailDecision {
  if (
    !input.recipientEmail ||
    input.delivery === 'WHATSAPP' ||
    input.delivery === 'PRINT'
  ) {
    return 'skip';
  }
  const due = input.deliverAt ? new Date(input.deliverAt) : null;
  if (due instanceof Date && !Number.isNaN(due.getTime()) && due > input.now) {
    return 'schedule';
  }
  return 'send';
}

export async function scheduleGiftEmail(
  tx: Prisma.TransactionClient,
  paymentId: string,
  metadata: Prisma.JsonValue | null,
  deliverAt: string,
  code: string,
): Promise<void> {
  await tx.payment.update({
    where: { id: paymentId },
    data: {
      metadata: mergeArcaMetadata(metadata, {
        giftEmailDue: deliverAt,
        giftCode: code,
      }),
    },
  });
}

/** Sends gift emails whose deliverAt has passed. Safe to run from the half-hour cron. */
export async function dispatchDueGiftEmails(
  prisma: PrismaService,
  send: (payload: GiftEmailPayload) => Promise<void>,
  now = new Date(),
): Promise<number> {
  const rows = await prisma.payment.findMany({
    where: { status: PaymentStatus.SUCCEEDED, source: PaymentSource.GIFT },
    orderBy: { confirmedAt: 'asc' },
    take: DUE_GIFT_EMAIL_SCAN,
    select: { id: true, amountCents: true, metadata: true },
  });
  let sent = 0;
  for (const row of rows) {
    const due = readDueGiftEmail(row.metadata, now);
    if (due === null) {
      continue;
    }
    await send({
      to: due.to,
      code: due.code,
      amountAmd: due.amountAmd ?? row.amountCents,
      message: due.message,
      ...(due.format === 'PHYSICAL' ? { format: 'PHYSICAL' as const } : {}),
    });
    await prisma.payment.update({
      where: { id: row.id },
      data: {
        metadata: mergeArcaMetadata(row.metadata, { giftEmailSent: true }),
      },
    });
    sent += 1;
  }
  return sent;
}

function readDueGiftEmail(
  metadata: Prisma.JsonValue | null,
  now: Date,
): {
  to: string;
  code: string;
  message?: string;
  amountAmd?: number;
  format?: 'PHYSICAL';
} | null {
  if (
    metadata === null ||
    typeof metadata !== 'object' ||
    Array.isArray(metadata)
  ) {
    return null;
  }
  const record = metadata as Record<string, unknown>;
  if (record.giftEmailSent === true) {
    return null;
  }
  const dueRaw = record.giftEmailDue;
  const to = record.recipientEmail;
  const code = record.giftCode;
  if (
    typeof dueRaw !== 'string' ||
    typeof to !== 'string' ||
    typeof code !== 'string'
  ) {
    return null;
  }
  const due = new Date(dueRaw);
  if (Number.isNaN(due.getTime()) || due > now) {
    return null;
  }
  const faceAmd = record.giftFaceAmd;
  return {
    to,
    code,
    message: typeof record.message === 'string' ? record.message : undefined,
    ...(typeof faceAmd === 'number' ? { amountAmd: faceAmd } : {}),
    ...(record.format === 'PHYSICAL' ? { format: 'PHYSICAL' as const } : {}),
  };
}
