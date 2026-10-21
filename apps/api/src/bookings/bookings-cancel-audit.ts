import type { Prisma } from '@prisma/client';

type CancelledBooking = {
  id: string;
  userId: string;
  sessionId: string;
};

/** Records who cancelled a booking. System cancels store actorRole SYSTEM. */
export async function writeBookingCancelledAudit(
  tx: Prisma.TransactionClient,
  booking: CancelledBooking,
  cancelledByUserId: string | undefined,
): Promise<void> {
  const actor =
    cancelledByUserId === undefined
      ? null
      : await tx.user.findUnique({
          where: { id: cancelledByUserId },
          select: { role: true },
        });
  await tx.auditLog.create({
    data: {
      actorId: cancelledByUserId ?? null,
      actorRole: actor?.role ?? 'SYSTEM',
      action: 'BOOKING_CANCELLED',
      entityType: 'Booking',
      entityId: booking.id,
      payload: JSON.stringify({
        userId: booking.userId,
        sessionId: booking.sessionId,
      }),
    },
  });
}
