import { BadRequestException } from '@nestjs/common';
import {
  ClassSessionStatus,
  GiftCardStatus,
  PaymentStatus,
} from '@prisma/client';
import { PaymentsService } from './payments.service';
import {
  AdminListPaymentsQueryDto,
  PaymentSourceFilter,
} from './dto/admin-list-payments-query.dto';

const PAYMENT_SOURCE = {
  PACKAGE: 'PACKAGE',
  DROPIN: 'DROPIN',
  GIFT: 'GIFT',
} as const;

type PaymentsServiceTestPrisma = {
  classSession: {
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  giftCardBatch: {
    findUnique: jest.Mock;
    updateMany: jest.Mock;
  };
  giftCard: {
    create: jest.Mock;
  };
  booking: {
    findUnique: jest.Mock;
    count: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
  };
  payment: {
    findFirst: jest.Mock;
    findUnique: jest.Mock;
    findMany: jest.Mock;
    create: jest.Mock<Promise<unknown>, [PaymentCreateCall]>;
    update: jest.Mock<Promise<unknown>, [PaymentUpdateCall]>;
    count: jest.Mock;
  };
  userPackage: {
    update: jest.Mock;
  };
  $transaction: jest.Mock;
};

type PaymentCreateCall = {
  data: {
    userId: string;
    amountCents: number;
    status: PaymentStatus;
    source: (typeof PAYMENT_SOURCE)[keyof typeof PAYMENT_SOURCE];
    sourceId: string;
  };
};

type PaymentUpdateCall = {
  where: {
    id: string;
  };
  data: {
    status: PaymentStatus;
    confirmedByAdminId: string;
  };
};

describe('PaymentsService', () => {
  function createService(): {
    service: PaymentsService;
    prisma: PaymentsServiceTestPrisma;
  } {
    const prisma = {} as PaymentsServiceTestPrisma;
    Object.assign(prisma, {
      classSession: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      giftCardBatch: {
        findUnique: jest.fn(),
        updateMany: jest.fn(),
      },
      giftCard: {
        create: jest.fn(),
      },
      booking: {
        findUnique: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn(),
      },
      payment: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'p1',
            amountCents: 10_000,
            currency: 'amd',
            status: PaymentStatus.SUCCEEDED,
            source: PAYMENT_SOURCE.PACKAGE,
            description: 'Package subscription',
            createdAt: new Date(),
            user: {
              id: 'u1',
              email: 'u1@test.com',
              name: 'User',
              lastName: 'One',
              phone: null,
              role: 'USER',
            },
          },
        ]),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn().mockResolvedValue(1),
      },
      userPackage: {
        update: jest.fn(),
      },
      $transaction: jest.fn(
        (callback: (tx: PaymentsServiceTestPrisma) => unknown) =>
          callback(prisma),
      ),
    });
    const config = { get: jest.fn().mockReturnValue(undefined) };
    const mail = { sendEmail: jest.fn() };
    return {
      service: new PaymentsService(
        prisma as never,
        config as never,
        mail as never,
      ),
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
    const query: AdminListPaymentsQueryDto = {
      source: PaymentSourceFilter.PACKAGE,
      take: 10,
      offset: 0,
    };
    const result = await service.adminListPayments(query);

    expect(prisma.payment.findMany).toHaveBeenCalled();
    expect(result.total).toBe(1);
    expect(result.items[0]?.source).toBe('package');
  });

  it('adminListPayments applies q search filter', async () => {
    const { service, prisma } = createService();
    await service.adminListPayments({
      q: 'alice@studio.test',
      take: 10,
      offset: 0,
    });

    type FindManyArgs = {
      where: {
        OR: Array<{
          user?: { email: { contains: string; mode: string } };
        }>;
      };
    };

    const findManyMock = prisma.payment.findMany as jest.Mock<
      Promise<unknown>,
      [FindManyArgs]
    >;
    expect(findManyMock).toHaveBeenCalledTimes(1);
    const callArgs = findManyMock.mock.calls[0][0];
    const emailClause = callArgs.where.OR.find(
      (clause) => clause.user?.email !== undefined,
    );

    expect(emailClause).toEqual({
      user: {
        email: {
          contains: 'alice@studio.test',
          mode: 'insensitive',
        },
      },
    });
  });

  it('createDropInCheckout rejects when session is already booked', async () => {
    const { service, prisma } = createService();
    prisma.classSession.findUnique.mockResolvedValue({
      id: 's1',
      status: 'ACTIVE',
      startsAt: new Date(Date.now() + 60 * 60 * 1000),
      capacity: 10,
    });
    prisma.booking.findUnique.mockResolvedValue({
      id: 'b1',
      status: 'BOOKED',
    });

    await expect(
      service.createDropInCheckout('u1', 's1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('createDropInCheckout rejects when session is full', async () => {
    const { service, prisma } = createService();
    prisma.classSession.findUnique.mockResolvedValue({
      id: 's1',
      status: 'ACTIVE',
      startsAt: new Date(Date.now() + 60 * 60 * 1000),
      capacity: 1,
    });
    prisma.booking.findUnique.mockResolvedValue(null);
    prisma.booking.count.mockResolvedValue(1);

    await expect(
      service.createDropInCheckout('u1', 's1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('createDropInCheckout creates a pending internal payment', async () => {
    const { service, prisma } = createService();
    prisma.classSession.findUnique.mockResolvedValue({
      id: 's1',
      status: ClassSessionStatus.ACTIVE,
      startsAt: new Date(Date.now() + 60 * 60 * 1000),
      capacity: 10,
      priceCents: 5_000,
    });
    prisma.booking.findUnique.mockResolvedValue(null);
    prisma.booking.count.mockResolvedValue(0);
    prisma.payment.findFirst.mockResolvedValue(null);
    prisma.payment.create.mockResolvedValue({ id: 'p1' });

    await service.createDropInCheckout('u1', 's1');

    const paymentCreateCall = prisma.payment.create.mock.calls[0]?.[0];
    expect(paymentCreateCall.data).toMatchObject({
      userId: 'u1',
      amountCents: 5_000,
      status: PaymentStatus.PENDING,
      source: PAYMENT_SOURCE.DROPIN,
      sourceId: 's1',
    });
  });

  it('adminUpdatePaymentStatus confirms drop-in payments transactionally', async () => {
    const { service, prisma } = createService();
    prisma.payment.findUnique.mockResolvedValue({
      id: 'p1',
      userId: 'u1',
      userPackageId: null,
      source: PAYMENT_SOURCE.DROPIN,
      sourceId: 's1',
      status: PaymentStatus.PENDING,
    });
    prisma.classSession.findUnique.mockResolvedValue({
      id: 's1',
      status: ClassSessionStatus.ACTIVE,
      startsAt: new Date(Date.now() + 60 * 60 * 1000),
      capacity: 2,
    });
    prisma.booking.findUnique.mockResolvedValue(null);
    prisma.booking.count.mockResolvedValue(1);

    await service.adminUpdatePaymentStatus(
      'p1',
      PaymentStatus.SUCCEEDED,
      'admin1',
    );

    expect(prisma.booking.create).toHaveBeenCalledWith({
      data: { userId: 'u1', sessionId: 's1', status: 'BOOKED' },
    });
    expect(prisma.classSession.update).toHaveBeenCalledWith({
      where: { id: 's1' },
      data: { status: ClassSessionStatus.FULL },
    });
    const paymentUpdateCall = prisma.payment.update.mock.calls[0]?.[0];
    expect(paymentUpdateCall).toMatchObject({
      where: { id: 'p1' },
    });
    expect(paymentUpdateCall.data).toMatchObject({
      status: PaymentStatus.SUCCEEDED,
      confirmedByAdminId: 'admin1',
    });
  });

  it('gift quantity decreases only when admin confirms payment', async () => {
    const { service, prisma } = createService();
    prisma.giftCardBatch.findUnique.mockResolvedValue({
      id: 'batch1',
      amountAmd: 10_000,
      availableQuantity: 1,
      status: GiftCardStatus.ACTIVE,
      imageUrl: null,
      expiresAt: null,
      message: null,
      recipientName: null,
      recipientEmail: null,
    });
    prisma.payment.create.mockResolvedValue({ id: 'pendingGift' });

    await service.createGiftCheckout({
      purchaserId: 'u1',
      batchId: 'batch1',
      amountCents: 10_000,
    });

    expect(prisma.giftCardBatch.updateMany).not.toHaveBeenCalled();

    prisma.payment.findUnique.mockResolvedValue({
      id: 'pendingGift',
      userId: 'u1',
      amountCents: 10_000,
      source: PAYMENT_SOURCE.GIFT,
      sourceId: 'batch1',
      status: PaymentStatus.PENDING,
      metadata: {},
    });
    prisma.giftCardBatch.updateMany.mockResolvedValue({ count: 1 });

    await service.adminUpdatePaymentStatus(
      'pendingGift',
      PaymentStatus.SUCCEEDED,
      'admin1',
    );

    expect(prisma.giftCardBatch.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'batch1',
        status: GiftCardStatus.ACTIVE,
        availableQuantity: { gt: 0 },
      },
      data: { availableQuantity: { decrement: 1 } },
    });
    expect(prisma.giftCard.create).toHaveBeenCalled();
  });
});
