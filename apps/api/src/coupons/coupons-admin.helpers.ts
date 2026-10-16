import { BadRequestException } from '@nestjs/common';
import { CouponDiscountType, type Prisma } from '@prisma/client';
import {
  COUPON_PERCENT_MAX,
  COUPON_PERCENT_MIN,
} from './coupon.constants';
import { normalizeCouponCode } from './coupon-code.util';
import type { UpsertCouponDto } from './dto/upsert-coupon.dto';

type ResolvedProduct = {
  productKind: NonNullable<UpsertCouponDto['eligibleProducts']>[number]['kind'];
  packagePlanId: string | null;
};

export type CouponScalarData = ReturnType<typeof couponScalarData>;

export function couponScalarData(
  dto: UpsertCouponDto,
  userIds: string[],
): Omit<Prisma.CouponCreateInput, 'createdBy' | 'eligibleUsers' | 'eligibleProducts'> & {
  userIds: string[];
  products: ResolvedProduct[];
} {
  const code = normalizeCouponCode(dto.code);
  if (code === null) {
    throw new BadRequestException('Invalid code');
  }
  assertDiscountValue(dto);
  const validFrom = parseOptionalDate(dto.validFrom);
  const validUntil = parseOptionalDate(dto.validUntil);
  if (validFrom && validUntil && validFrom.getTime() > validUntil.getTime()) {
    throw new BadRequestException('Valid from must be before valid until');
  }
  const products = resolveProducts(dto);
  if (!dto.eligibleAllUsers && userIds.length === 0) {
    throw new BadRequestException('Choose at least one user');
  }
  if (!dto.eligibleAllProducts && products.length === 0) {
    throw new BadRequestException('Choose at least one product');
  }
  return {
    code,
    discountType: dto.discountType,
    discountValue: dto.discountValue,
    validFrom,
    validUntil,
    totalUsageLimit: dto.totalUsageLimit ?? null,
    usageLimitPerUser: dto.usageLimitPerUser ?? null,
    eligibleAllUsers: dto.eligibleAllUsers,
    eligibleAllProducts: dto.eligibleAllProducts,
    userIds: dto.eligibleAllUsers ? [] : userIds,
    products: dto.eligibleAllProducts ? [] : products,
  };
}

function assertDiscountValue(dto: UpsertCouponDto): void {
  if (dto.discountType !== CouponDiscountType.PERCENTAGE) {
    return;
  }
  if (dto.discountValue < COUPON_PERCENT_MIN || dto.discountValue > COUPON_PERCENT_MAX) {
    throw new BadRequestException('Percentage must be between 1 and 100');
  }
}

function parseOptionalDate(value: string | undefined): Date | null {
  if (value === undefined || value.trim().length === 0) {
    return null;
  }
  return new Date(value);
}

function resolveProducts(dto: UpsertCouponDto): ResolvedProduct[] {
  const seen = new Set<string>();
  const products: ResolvedProduct[] = [];
  for (const row of dto.eligibleProducts ?? []) {
    const packagePlanId = row.packagePlanId?.trim() || null;
    const key = `${row.kind}:${packagePlanId ?? ''}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    products.push({ productKind: row.kind, packagePlanId });
  }
  return products;
}
