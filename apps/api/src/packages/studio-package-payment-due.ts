import { BookingStatus, type Prisma } from '@prisma/client';
import { isStudioManualPaymentMethod } from '../payments/studio-manual-payment.util';

export const STUDIO_PACKAGE_PAYMENT_DUE_AFTER_CLASS_MS = 60 * 60 * 1000;

export function studioPackagePaymentDueCutoff(now: Date = new Date()): Date {
  return new Date(now.getTime() - STUDIO_PACKAGE_PAYMENT_DUE_AFTER_CLASS_MS);
}

export function isStudioUnpaidPayment(params: {
  paymentStatus: string | null;
  paymentMethod: string | null;
}): boolean {
  return (
    params.paymentStatus === 'PENDING' &&
    isStudioManualPaymentMethod(params.paymentMethod)
  );
}

/** Package IDs that have a consumed class whose end was at least one hour ago. */
export async function loadStudioPackagePaymentDueIds(
  db: {
    bookingConsumption: {
      findMany: (args: {
        where: Prisma.BookingConsumptionWhereInput;
        select: { userPackageId: true };
      }) => Promise<Array<{ userPackageId: string }>>;
    };
  },
  packageIds: readonly string[],
  now: Date = new Date(),
): Promise<Set<string>> {
  if (packageIds.length === 0) {
    return new Set();
  }
  const rows = await db.bookingConsumption.findMany({
    where: {
      userPackageId: { in: [...packageIds] },
      restoredAt: null,
      booking: {
        status: { in: [BookingStatus.BOOKED, BookingStatus.COMPLETED] },
        session: { endsAt: { lte: studioPackagePaymentDueCutoff(now) } },
      },
    },
    select: { userPackageId: true },
  });
  return new Set(rows.map((row) => row.userPackageId));
}
