import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { COUPON_CODE_MAX_LENGTH } from '../../coupons/coupon.constants';

export class CreateCartCheckoutDto {
  @IsOptional()
  @IsString()
  packagePlanId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  barProductId?: string;

  @IsOptional()
  @IsBoolean()
  useGiftCredits?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(COUPON_CODE_MAX_LENGTH)
  couponCode?: string;
}
