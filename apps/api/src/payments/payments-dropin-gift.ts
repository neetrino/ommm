import { PaymentStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { mergeArcaMetadata } from './arca/arca-metadata.util';
import {
  buildGiftCreditsPaymentMetadata,
  readGiftCreditsAllocations,
  readGiftCreditsAppliedCents,
  reserveGiftCreditsForPackage,
  resolveGiftCreditsApplication,
} from '../packages/package-gift-credits.util';
import { GIFT_CREDIT_SPEND_PREFIX } from '../reports/studio-analytics.helpers';

type DropInGiftTx = Prisma.TransactionClient;

/** How much of a drop-in price gift credit can cover before the bank charge. */
export function planDropInGiftCharge(input: {
  priceCents: number;
  spendableCents: number;
  useGiftCredits: boolean;
}): { appliedCents: number; chargeCents: number } {
  return resolveGiftCreditsApplication({
    useGiftCredits: input.useGiftCredits,
    spendableCents: input.spendableCents,
    finalPriceCents: input.priceCents,
  });
}

/** Debits gift credit once, when the drop-in payment is actually fulfilled. */
export async function reservePendingDropInGift(
  tx: DropInGiftTx,
  payment: { id: string; userId: string; metadata: Prisma.JsonValue | null },
): Promise<void> {
  const appliedCents = readGiftCreditsAppliedCents(payment.metadata);
  if (appliedCents <= 0 || readGiftCreditsAllocations(payment.metadata) !== null) {
    return;
  }
  const allocations = await reserveGiftCreditsForPackage(tx, {
    userId: payment.userId,
    appliedCents,
    orderId: payment.id,
  });
  await tx.payment.update({
    where: { id: payment.id },
    data: {
      metadata: mergeArcaMetadata(
        payment.metadata,
        buildGiftCreditsPaymentMetadata(appliedCents, allocations),
      ),
    },
  });
  await tx.payment.create({
    data: {
      userId: payment.userId,
      amountCents: appliedCents,
      currency: 'amd',
      status: PaymentStatus.SUCCEEDED,
      description: `${GIFT_CREDIT_SPEND_PREFIX} for drop-in`,
      confirmedAt: new Date(),
    },
  });
}
