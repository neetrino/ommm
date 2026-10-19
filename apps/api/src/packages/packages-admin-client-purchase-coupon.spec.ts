import { BadRequestException } from '@nestjs/common';
import { CouponDiscountType } from '@prisma/client';
import { quoteCoupon } from '../coupons/coupon-quote.util';
import { bindCouponRedemption } from '../coupons/coupon-redemption.util';
import { PackagesAdminClientPurchaseService } from './packages-admin-client-purchase.service';

jest.mock('../coupons/coupon-quote.util', () => ({
  quoteCoupon: jest.fn(),
}));

jest.mock('../coupons/coupon-redemption.util', () => ({
  bindCouponRedemption: jest.fn().mockResolvedValue(undefined),
}));

const quoteCouponMock = jest.mocked(quoteCoupon);
const bindCouponMock = jest.mocked(bindCouponRedemption);

function createPlan() {
  return {
    id: 'plan-1',
    name: 'Reformer 8',
    categoryName: 'Reformer',
    isActive: true,
    priceCents: 120_000,
    discountedPriceCents: null,
    currency: 'AMD',
    availableQuantity: 5,
    periodDays: 30,
    sessionsPerMonth: 8,
    isUnlimited: false,
    guestCount: 0,
    freezeAllowedCount: 0,
    freezeMaxDaysPerUse: 0,
    classTypeId: null,
    typeSessionAllocations: [],
  };
}

describe('staff package coupon', () => {
  beforeEach(() => {
    quoteCouponMock.mockReset();
    bindCouponMock.mockReset();
    bindCouponMock.mockResolvedValue(undefined);
  });

  it('charges the discounted amount and reserves the code until payment', async () => {
    quoteCouponMock.mockResolvedValue({
      couponId: 'coupon-1',
      code: 'EXAMPLE',
      discountType: CouponDiscountType.PERCENTAGE,
      discountValue: 20,
      createdById: 'admin-1',
      originalAmountCents: 120_000,
      discountAmountCents: 24_000,
      remainderGiftCents: 0,
      amountAfterCouponCents: 96_000,
    });
    const paymentCreate = jest.fn((args: { data: { amountCents: number } }) =>
      Promise.resolve({
        id: 'pay-1',
        amountCents: args.data.amountCents,
        currency: 'amd',
      }),
    );
    const service = new PackagesAdminClientPurchaseService(
      {
        user: { findFirst: jest.fn().mockResolvedValue({ id: 'client-1' }) },
        packagePlan: { findUnique: jest.fn().mockResolvedValue(createPlan()) },
        $transaction: jest.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
          callback({
            userPackage: { create: jest.fn().mockResolvedValue({ id: 'up-1' }) },
            payment: { create: paymentCreate },
            userPackageBalance: { create: jest.fn().mockResolvedValue({ id: 'bal-1' }) },
            packagePlan: {
              updateMany: jest.fn().mockResolvedValue({ count: 1 }),
              findUnique: jest.fn(),
            },
          }),
        ),
      } as never,
      { invalidatePublicPlansCache: jest.fn() } as never,
      { tryNotify: jest.fn() } as never,
      { trySendCashPendingEmail: jest.fn() } as never,
    );

    const result = await service.purchase({
      adminId: 'admin-1',
      clientId: 'client-1',
      planId: 'plan-1',
      paymentMethod: 'CASH',
      couponCode: 'example',
    });

    expect(result.amountCents).toBe(96_000);
    expect(result.couponCode).toBe('EXAMPLE');
    expect(paymentCreate.mock.calls[0]?.[0].data.amountCents).toBe(96_000);
    expect(bindCouponMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        userId: 'client-1',
        paymentId: 'pay-1',
        applyNow: false,
      }),
    );
  });

  it('rejects a promo code on an influencer package', async () => {
    const transaction = jest.fn();
    const service = new PackagesAdminClientPurchaseService(
      {
        user: { findFirst: jest.fn().mockResolvedValue({ id: 'client-1' }) },
        packagePlan: { findUnique: jest.fn().mockResolvedValue(createPlan()) },
        $transaction: transaction,
      } as never,
      { invalidatePublicPlansCache: jest.fn() } as never,
      { tryNotify: jest.fn() } as never,
      { trySendCashPendingEmail: jest.fn() } as never,
    );

    await expect(
      service.purchase({
        adminId: 'admin-1',
        clientId: 'client-1',
        planId: 'plan-1',
        paymentMethod: 'INFLUENCER',
        couponCode: 'EXAMPLE',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(transaction).not.toHaveBeenCalled();
    expect(quoteCouponMock).not.toHaveBeenCalled();
  });
});
