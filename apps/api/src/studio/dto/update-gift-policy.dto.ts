import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsInt, Max, Min } from 'class-validator';

const GIFT_POLICY_DENOMINATION_CAP = 8;
const GIFT_POLICY_MAX_VALIDITY_MONTHS = 60;

export class UpdateGiftPolicyDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minAmountAmd!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(GIFT_POLICY_MAX_VALIDITY_MONTHS)
  validityMonths!: number;

  @IsArray()
  @ArrayMaxSize(GIFT_POLICY_DENOMINATION_CAP)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  denominationsAmd!: number[];
}
