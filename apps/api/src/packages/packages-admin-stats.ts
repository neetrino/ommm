import {
  PaymentSource,
  PaymentStatus,
  type Prisma,
  type PrismaClient,
} from '@prisma/client';

/** Completed package purchases (online, cash, terminal, influencer, admin assign). */
export const SOLD_PACKAGE_PAYMENTS_WHERE: Prisma.PaymentWhereInput = {
  source: PaymentSource.PACKAGE,
  status: PaymentStatus.SUCCEEDED,
  sourceId: { not: null },
};

export async function countTotalPackagesSold(
  prisma: PrismaClient,
): Promise<number> {
  return prisma.payment.count({
    where: SOLD_PACKAGE_PAYMENTS_WHERE,
  });
}
