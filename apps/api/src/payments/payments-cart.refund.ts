import { BookingStatus, ClassSessionStatus, type Prisma } from '@prisma/client';
import { restoreGiftClassSpend } from '../gift-cards/gift-card-class-credit';
import type { PrismaService } from '../prisma/prisma.service';
import { readCartCheckout } from './payments-cart.fulfill';

/** Returns class credit and cancels the cart booking when that payment is refunded. */
export async function undoStudioCartGift(
  prisma: PrismaService,
  params: {
    paymentId: string;
    userId: string;
    metadata: Prisma.JsonValue | null;
  },
): Promise<void> {
  const cart = readCartCheckout(params.metadata);
  if (cart?.sessionId === undefined && (cart?.classSessionsCovered ?? 0) <= 0) {
    return;
  }
  await restoreGiftClassSpend(prisma, params.paymentId);
  if (!cart?.sessionId) {
    return;
  }
  await prisma.booking.updateMany({
    where: {
      userId: params.userId,
      sessionId: cart.sessionId,
      status: BookingStatus.BOOKED,
    },
    data: { status: BookingStatus.CANCELLED, cancelledAt: new Date() },
  });
  await prisma.classSession.updateMany({
    where: { id: cart.sessionId, status: ClassSessionStatus.FULL },
    data: { status: ClassSessionStatus.ACTIVE },
  });
}
