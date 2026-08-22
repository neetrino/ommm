import { PaymentSource, PaymentStatus } from '@prisma/client';
import { countTotalPackagesSold } from './packages-admin-stats';

describe('countTotalPackagesSold', () => {
  it('counts succeeded package payments with a linked membership', async () => {
    const prisma = {
      payment: {
        count: jest.fn().mockResolvedValue(42),
      },
    };

    const total = await countTotalPackagesSold(prisma as never);

    expect(total).toBe(42);
    expect(prisma.payment.count).toHaveBeenCalledWith({
      where: {
        source: PaymentSource.PACKAGE,
        status: PaymentStatus.SUCCEEDED,
        sourceId: { not: null },
      },
    });
  });
});
