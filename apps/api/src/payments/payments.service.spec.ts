import { BadRequestException, ConflictException } from '@nestjs/common';
import {
  ManualPaymentMethod,
  MembershipStatus,
  PaymentStatus,
} from '@prisma/client';
import { PaymentsService } from './payments.service';
import {
  AdminListPaymentsQueryDto,
  PaymentSourceFilter,
} from './dto/admin-list-payments-query.dto';

describe('PaymentsService', () => {
  function createService() {
    const prisma = {
      classSession: {
        findUnique: jest.fn(),
      },
      booking: {
        findUnique: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      membershipPlan: {
        findUnique: jest.fn(),
      },
      userMembership: {
        findFirst: jest.fn(),
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
            description: 'Package subscription',
            planId: null,
            createdAt: new Date(),
            user: {
              id: 'u1',
              email: 'u1@test.com',
              name: 'User',
              lastName: 'One',
              phone: null,
              role: 'USER',
            },
            plan: null,
          },
        ]),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn().mockResolvedValue(1),
      },
      $transaction: jest.fn((ops: unknown[]) => Promise.all(ops)),
    };
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

  it('createManualPackagePayment creates pending payment and membership', async () => {
    const { service, prisma } = createService();
    prisma.membershipPlan.findUnique.mockResolvedValue({
      id: 'plan1',
      name: 'Monthly',
      isActive: true,
      priceCents: 25_000,
      currency: 'AMD',
      periodDays: 30,
      isUnlimited: false,
      sessionsPerMonth: 8,
    });
    prisma.userMembership.findFirst.mockResolvedValue(null);
    prisma.payment.findFirst.mockResolvedValue(null);
    prisma.userMembership.create.mockResolvedValue({ id: 'm1' });
    prisma.payment.create.mockResolvedValue({
      id: 'pay1',
      paymentMethod: ManualPaymentMethod.CASH,
      status: PaymentStatus.PENDING,
      plan: { id: 'plan1', name: 'Monthly' },
    });

    const result = await service.createManualPackagePayment(
      'u1',
      'plan1',
      ManualPaymentMethod.CASH,
    );

    expect(prisma.userMembership.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: MembershipStatus.PENDING,
          userId: 'u1',
          planId: 'plan1',
        }),
      }),
    );
    expect(result.paymentMethod).toBe(ManualPaymentMethod.CASH);
  });

  it('createManualPackagePayment rejects duplicate pending request', async () => {
    const { service, prisma } = createService();
    prisma.membershipPlan.findUnique.mockResolvedValue({
      id: 'plan1',
      isActive: true,
      priceCents: 1000,
      currency: 'AMD',
      periodDays: 30,
      isUnlimited: true,
      sessionsPerMonth: null,
    });
    prisma.userMembership.findFirst.mockResolvedValue(null);
    prisma.payment.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(
      service.createManualPackagePayment(
        'u1',
        'plan1',
        ManualPaymentMethod.CARD,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
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
});
