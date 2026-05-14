import { BadRequestException } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { PaymentSourceFilter } from './dto/admin-list-payments-query.dto';

describe('PaymentsService', () => {
  function createService() {
    const prisma = {
      payment: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'p1',
            amountCents: 10_000,
            currency: 'amd',
            status: PaymentStatus.SUCCEEDED,
            description: 'Membership subscription',
            createdAt: new Date(),
            user: {
              id: 'u1',
              email: 'u1@test.com',
              name: 'User',
              lastName: 'One',
              role: 'USER',
            },
          },
        ]),
        count: jest.fn().mockResolvedValue(1),
      },
    };
    const config = { get: jest.fn().mockReturnValue(undefined) };
    const mail = { sendEmail: jest.fn() };
    return {
      service: new PaymentsService(prisma as never, config as never, mail as never),
      prisma,
    };
  }

  it('adminListPayments rejects invalid date range', async () => {
    const { service } = createService();
    await expect(
      service.adminListPayments({
        from: '2026-05-14T00:00:00.000Z',
        to: '2026-05-01T00:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('adminListPayments returns mapped source and pagination', async () => {
    const { service, prisma } = createService();
    const result = await service.adminListPayments({
      source: PaymentSourceFilter.MEMBERSHIP,
      take: 10,
      offset: 0,
    });

    expect(prisma.payment.findMany).toHaveBeenCalled();
    expect(result.total).toBe(1);
    expect(result.items[0]?.source).toBe('membership');
  });
});
