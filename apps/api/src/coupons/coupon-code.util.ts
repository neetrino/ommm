import { BadRequestException } from '@nestjs/common';
import {
  COUPON_CODE_MAX_LENGTH,
  COUPON_CODE_MIN_LENGTH,
  COUPON_CODE_PATTERN,
  COUPON_ERROR,
} from './coupon.constants';

/** Uppercase coupon code, or null when the field was left empty. */
export function normalizeCouponCode(
  value: string | undefined | null,
): string | null {
  const compact = (value ?? '').replace(/\s+/g, '').toUpperCase();
  if (compact.length === 0) {
    return null;
  }
  if (
    compact.length < COUPON_CODE_MIN_LENGTH ||
    compact.length > COUPON_CODE_MAX_LENGTH ||
    !COUPON_CODE_PATTERN.test(compact)
  ) {
    throw new BadRequestException(COUPON_ERROR.INVALID);
  }
  return compact;
}
