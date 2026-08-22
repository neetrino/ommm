import {
  PaymentSource,
  PaymentStatus,
  type PrismaClient,
} from '@prisma/client';

/** Completed package purchases (online, cash, terminal, influencer, admin assign). */
export async function countTotalPackagesSold(
  prisma: PrismaClient,
): Promise<number> {
  return prisma.payment.count({
    where: {
      source: PaymentSource.PACKAGE,
      status: PaymentStatus.SUCCEEDED,
      sourceId: { not: null },
    },
  });
}
